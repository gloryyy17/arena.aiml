const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

describe('Event Moderation & Certificate APIs', () => {
  let facultyToken;
  let adminToken;
  let studentToken;

  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_123';
    facultyToken = jwt.sign(
      { id: 'mock-user-faculty-1', role: 'faculty', email: 'faculty@arena.aiml' },
      process.env.JWT_SECRET
    );
    adminToken = jwt.sign(
      { id: 'mock-user-admin-1', role: 'admin', email: 'admin@arena.aiml' },
      process.env.JWT_SECRET
    );
    studentToken = jwt.sign(
      { id: 'mock-user-student-1', role: 'student', email: 'student@arena.aiml' },
      process.env.JWT_SECRET
    );
  });

  describe('Faculty Event Submission & Admin Moderation', () => {
    let createdEventId;

    test('Faculty creates an event draft', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Campus Hackathon Test',
          description: 'A test hackathon description.',
          category: 'Technical',
          venue: 'Lab 1',
          startDate: '2026-10-10',
          endDate: '2026-10-11',
          registrationDeadline: '2026-10-08',
          maxParticipants: 50,
          fee: 0,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.event).toBeDefined();
      expect(res.body.event.status).toBe('draft');
      createdEventId = res.body.event._id;
    });

    test('Faculty submits event for admin approval', async () => {
      const res = await request(app)
        .patch(`/api/events/${createdEventId}/submit`)
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.event.status).toBe('pending');
      expect(res.body.event.isPublished).toBe(false);
    });

    test('Admin rejects event with specific reason', async () => {
      const res = await request(app)
        .patch(`/api/events/${createdEventId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Schedule conflict with major department symposium',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.event.status).toBe('rejected');
      expect(res.body.event.rejectionReason).toBe('Schedule conflict with major department symposium');
    });

    test('Faculty resubmits rejected event', async () => {
      const res = await request(app)
        .patch(`/api/events/${createdEventId}/submit`)
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.event.status).toBe('pending');
    });

    test('Admin approves event and publishes it', async () => {
      const res = await request(app)
        .patch(`/api/events/${createdEventId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.event.status).toBe('approved');
      expect(res.body.event.isPublished).toBe(true);
    });
  });

  describe('Certificate Generation & Verification', () => {
    let generatedVerificationId;

    test('POST /api/certificates/generate creates verifiable certificate', async () => {
      const res = await request(app)
        .post('/api/certificates/generate')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          participantName: 'Priya Sharma',
          eventName: 'Dance Smash 2026',
          certificateType: 'Participation',
          organizerName: 'Faculty Coordinator',
          hodName: 'Dr. Animesh Tayal',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.certificate).toBeDefined();
      expect(res.body.certificate.participantName).toBe('Priya Sharma');
      expect(res.body.certificate.verificationId).toMatch(/^CERT-SBJ-/);
      generatedVerificationId = res.body.certificate.verificationId;
    });

    test('GET /api/certificates/verify/:id publicly verifies certificate', async () => {
      const res = await request(app)
        .get(`/api/certificates/verify/${generatedVerificationId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.valid).toBe(true);
      expect(res.body.certificate.participantName).toBe('Priya Sharma');
    });

    test('POST /api/certificates/ai-citation generates tailored citation text', async () => {
      const res = await request(app)
        .post('/api/certificates/ai-citation')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          participantName: 'Priya Sharma',
          eventName: 'Dance Smash 2026',
          certificateType: 'Participation',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.citation).toContain('PRIYA SHARMA');
      expect(res.body.citation).toContain('DANCE SMASH 2026');
    });
  });
});
