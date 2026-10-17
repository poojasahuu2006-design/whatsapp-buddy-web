import { calendarService } from '../services/calendarService.js';

export const getEvents = (req, res) => {
  const events = calendarService.getEvents();
  res.json({
    success: true,
    total: events.length,
    calendarEmail: calendarService.calendarEmail,
    timezone: calendarService.timezone,
    events
  });
};

export const scheduleEvent = async (req, res, next) => {
  try {
    const { clientName, clientNumber, requestedTimeText, summary } = req.body;
    const result = await calendarService.scheduleEvent({
      clientName: clientName || 'Client',
      clientNumber: clientNumber || '',
      requestedTimeText: requestedTimeText || 'tomorrow at 4pm',
      summary
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = (req, res) => {
  const { id } = req.params;
  const result = calendarService.deleteEvent(id);
  res.json(result);
};
