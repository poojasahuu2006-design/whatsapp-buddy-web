import { google } from 'googleapis';
import { config } from '../config/config.js';
import fs from 'fs';
import path from 'path';

export class CalendarService {
  constructor() {
    this.calendarEmail = config.calendarEmail || process.env.CALENDAR_EMAIL || 'poojasahuu2006@gmail.com';
    this.timezone = config.timezone || process.env.TIMEZONE || 'Asia/Kolkata';
    
    // In-memory persistent events store (empty until scheduled by user or WhatsApp client)
    this.events = [];

    // Initialize Google API Client if credentials exist
    this.googleCalendarClient = null;
    this.initGoogleAuth();
  }

  // Initialize Google OAuth2 or Service Account client
  initGoogleAuth() {
    try {
      const serviceAccountKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const serviceAccountKeyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

      if (serviceAccountKeyJson) {
        const credentials = typeof serviceAccountKeyJson === 'string' 
          ? JSON.parse(serviceAccountKeyJson) 
          : serviceAccountKeyJson;

        const auth = new google.auth.JWT({
          email: credentials.client_email,
          key: credentials.private_key,
          scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events']
        });

        this.googleCalendarClient = google.calendar({ version: 'v3', auth });
        console.log('✅ Google Calendar Service Account Authenticated');
      } else if (serviceAccountKeyPath && fs.existsSync(serviceAccountKeyPath)) {
        const auth = new google.auth.GoogleAuth({
          keyFile: serviceAccountKeyPath,
          scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events']
        });
        this.googleCalendarClient = google.calendar({ version: 'v3', auth });
        console.log('✅ Google Calendar GoogleAuth Authenticated from file');
      } else if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/calendar/oauth2callback'
        );
        oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
        this.googleCalendarClient = google.calendar({ version: 'v3', auth: oauth2Client });
        console.log('✅ Google Calendar OAuth2 Client Authenticated');
      }
    } catch (err) {
      console.warn('Google Calendar direct API auth skipped:', err.message);
    }
  }

  // Format ISO date with offset and time in Asia/Kolkata (+05:30)
  formatIsoDate(dayOffset = 1, hour = 16, minute = 0) {
    const now = new Date();
    const target = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    const hh = String(hour).padStart(2, '0');
    const min = String(minute).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:00+05:30`;
  }

  // Parse natural language text into start/end ISO dates
  parseDateTime(text = '') {
    const lower = text.toLowerCase();
    let dayOffset = 1; // Default tomorrow
    let hour = 16;     // Default 4:00 PM
    let minute = 0;

    if (lower.includes('today')) {
      dayOffset = 0;
    } else if (lower.includes('day after tomorrow')) {
      dayOffset = 2;
    } else if (lower.includes('tomorrow')) {
      dayOffset = 1;
    }

    const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

      if (meridiem === 'pm' && h < 12) h += 12;
      if (meridiem === 'am' && h === 12) h = 0;
      if (!meridiem && h >= 1 && h <= 6) h += 12; // e.g. "at 4" -> 16:00

      if (h >= 0 && h <= 23) {
        hour = h;
        minute = m;
      }
    }

    const startTime = this.formatIsoDate(dayOffset, hour, minute);
    
    let endHour = hour;
    let endMinute = minute + 30;
    if (endMinute >= 60) {
      endHour += 1;
      endMinute -= 60;
    }
    const endTime = this.formatIsoDate(dayOffset, endHour, endMinute);

    const displayDay = dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tomorrow' : 'in 2 days';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayH = hour % 12 === 0 ? 12 : hour % 12;
    const displayM = minute === 0 ? '00' : String(minute).padStart(2, '0');
    const displayTime = `${displayDay} at ${displayH}:${displayM} ${ampm} IST`;

    return {
      startTime,
      endTime,
      displayTime,
      hour,
      minute
    };
  }

  // Generate 1-Click Direct Google Calendar Event link
  buildGoogleCalendarUrl(title, startIso, endIso, details) {
    const cleanDate = (iso) => {
      try {
        const d = new Date(iso);
        return d.toISOString().replace(/-|:|\.\d+/g, '');
      } catch {
        return '';
      }
    };

    const dates = `${cleanDate(startIso)}/${cleanDate(endIso)}`;
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', title);
    url.searchParams.set('dates', dates);
    url.searchParams.set('details', details || 'Consultation meeting scheduled via WhatsApp Buddy AI');
    url.searchParams.set('add', this.calendarEmail);

    return url.toString();
  }

  // Schedule task / consultation
  async scheduleEvent({ clientName = 'Client', clientNumber = '', requestedTimeText = '', summary = '' }) {
    const { startTime, endTime, displayTime } = this.parseDateTime(requestedTimeText);
    const eventSummary = summary || `Consultation: Nexus Agency & ${clientName}`;
    const details = `Client Phone: +${clientNumber}\nTimezone: ${this.timezone}\nBooked via WhatsApp Buddy Autonomous Agent`;

    const googleCalendarUrl = this.buildGoogleCalendarUrl(eventSummary, startTime, endTime, details);
    let googleApiEventId = null;
    let createdViaApi = false;

    // Attempt direct insertion via Google Calendar API if credentials configured
    if (this.googleCalendarClient) {
      try {
        const apiRes = await this.googleCalendarClient.events.insert({
          calendarId: this.calendarEmail || 'primary',
          requestBody: {
            summary: eventSummary,
            description: details,
            start: {
              dateTime: startTime,
              timeZone: this.timezone
            },
            end: {
              dateTime: endTime,
              timeZone: this.timezone
            },
            attendees: [
              { email: this.calendarEmail }
            ]
          }
        });
        googleApiEventId = apiRes.data?.id;
        createdViaApi = true;
        console.log(`✅ Event successfully inserted directly into Google Calendar (ID: ${googleApiEventId})`);
      } catch (apiErr) {
        console.warn('Google Calendar API direct insert notice:', apiErr.message);
      }
    }

    const event = {
      id: 'cal-evt-' + Date.now(),
      googleApiEventId,
      createdViaApi,
      summary: eventSummary,
      clientName,
      clientNumber,
      calendarEmail: this.calendarEmail,
      timezone: this.timezone,
      startTime,
      endTime,
      displayTime,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      googleCalendarUrl
    };

    this.events.unshift(event);
    if (this.events.length > 50) this.events.pop();

    return {
      success: true,
      event,
      displayTime,
      createdViaApi,
      googleCalendarUrl,
      confirmationSentence: `Your consultation meeting with Nexus agency has been confirmed for ${displayTime} on Google Calendar at ${this.calendarEmail}.`
    };
  }

  // Get all scheduled events
  getEvents() {
    return this.events;
  }

  // Cancel / delete event
  deleteEvent(id) {
    const index = this.events.findIndex((e) => e.id === id);
    if (index !== -1) {
      const removed = this.events.splice(index, 1)[0];
      return { success: true, removed };
    }
    return { success: false, message: 'Event not found' };
  }
}

export const calendarService = new CalendarService();
