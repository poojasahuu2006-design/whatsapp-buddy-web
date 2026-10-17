import { Router } from 'express';
import { getEvents, scheduleEvent, deleteEvent } from '../controllers/calendarController.js';

const router = Router();

router.get('/calendar/events', getEvents);
router.post('/calendar/schedule', scheduleEvent);
router.delete('/calendar/events/:id', deleteEvent);

export default router;
