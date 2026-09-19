const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

// Mock User and Event Models for controller integration testing
jest.mock('../models/User', () => {
  return {
    findById: jest.fn().mockImplementation((id) => ({
      select: jest.fn().mockResolvedValue({
        _id: id || '60d0fe4f5311236168a109ca',
        name: 'Dr. Alan Turing',
        email: 'alan.turing@arena.aiml',
        role: 'faculty',
        department: 'AI & Data Science',
        interests: ['Artificial Intelligence', 'Machine Learning', 'Quantum Computing'],
        isActive: true,
      }),
    })),
    find: jest.fn().mockImplementation(() => ({
      select: jest.fn().mockResolvedValue([
        { _id: '60d0fe4f5311236168a109ca', name: 'Dr. Alan Turing', email: 'alan.turing@arena.aiml', role: 'faculty' },
        { _id: '60d0fe4f5311236168a109cb', name: 'Ada Lovelace', email: 'ada@arena.aiml', role: 'student' },
      ]),
    })),
  };
});

jest.mock('../models/Event', () => {
  return {
    findById: jest.fn().mockResolvedValue({
      _id: '60d0fe4f5311236168a109c1',
      title: 'Global AI Summit 2026',
      description: 'Annual gathering of AI practitioners and researchers.',
      category: 'Technical',
      department: 'AI & Data Science',
      venue: 'Auditorium A',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      maxParticipants: 200,
      fee: 0,
      status: 'approved',
      isPublished: true,
      tags: ['AI', 'Deep Learning'],
    }),
    findByIdAndUpdate: jest.fn().mockResolvedValue({
      _id: '60d0fe4f5311236168a109c1',
      title: 'Global AI Summit 2026',
    }),
    find: jest.fn().mockImplementation(() => ({
      select: jest.fn().mockImplementation(() => ({
        sort: jest.fn().mockImplementation(() => ({
          limit: jest.fn().mockResolvedValue([
            {
              _id: '60d0fe4f5311236168a109c1',
              title: 'Global AI Summit 2026',
              description: 'Annual gathering of AI practitioners and researchers.',
              category: 'Technical',
              department: 'AI & Data Science',
              venue: 'Auditorium A',
              startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
              fee: 0,
              maxParticipants: 200,
              tags: ['AI', 'Deep Learning'],
            },
          ]),
        })),
      })),
      populate: jest.fn().mockResolvedValue([
        {
          _id: '60d0fe4f5311236168a109c1',
          title: 'Global AI Summit 2026',
          description: 'Annual gathering of AI practitioners and researchers.',
          category: 'Technical',
          department: 'AI & Data Science',
          venue: 'Auditorium A',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          fee: 0,
          maxParticipants: 200,
          tags: ['AI', 'Deep Learning'],
          createdBy: { name: 'Dr. Alan Turing', department: 'AI & Data Science' },
        },
      ]),
    })),
  };
});

jest.mock('../models/AIGeneration', () => {
  return {
    create: jest.fn().mockResolvedValue({
      _id: '60d0fe4f5311236168a109c9',
      status: 'success',
    }),
    find: jest.fn().mockImplementation(() => ({
      sort: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockResolvedValue([]),
      })),
    })),
  };
});

jest.mock('../models/AIConversation', () => {
  return {
    create: jest.fn().mockResolvedValue({
      _id: '60d0fe4f5311236168a109cc',
      messages: [],
      save: jest.fn().mockResolvedValue(true),
    }),
    findOne: jest.fn().mockImplementation(() => ({
      sort: jest.fn().mockResolvedValue(null),
    })),
    find: jest.fn().mockImplementation(() => ({
      select: jest.fn().mockImplementation(() => ({
        sort: jest.fn().mockImplementation(() => ({
          limit: jest.fn().mockResolvedValue([]),
        })),
      })),
    })),
  };
});

jest.mock('../models/Feedback', () => {
  const sampleList = [
    { student: { name: 'Ada Lovelace', department: 'AI' }, rating: 5, comment: 'Exceptional hands-on workshop!' },
    { student: { name: 'Claude Shannon', department: 'CS' }, rating: 4, comment: 'Great materials, but start earlier.' },
  ];
  sampleList.populate = jest.fn().mockImplementation(() => ({
    sort: jest.fn().mockResolvedValue(sampleList),
  }));
  sampleList.sort = jest.fn().mockResolvedValue(sampleList);

  return {
    find: jest.fn().mockImplementation(() => sampleList),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({
      _id: '60d0fe4f5311236168a109cd',
      rating: 5,
      comment: 'Super event!',
    }),
  };
});

jest.mock('../models/AIFeedbackAnalysis', () => {
  return {
    create: jest.fn().mockImplementation((data) => Promise.resolve({ _id: '60d0fe4f5311236168a109ce', ...data })),
    findOne: jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        sort: jest.fn().mockResolvedValue({
          overallSentiment: 'positive',
          sentimentScore: 0.85,
          summary: 'Excellent workshop feedback.',
        }),
      })),
    })),
  };
});

jest.mock('../models/EmailCampaign', () => {
  return {
    create: jest.fn().mockImplementation((data) => ({
      ...data,
      _id: '60d0fe4f5311236168a109cf',
      save: jest.fn().mockResolvedValue(true),
    })),
    find: jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        sort: jest.fn().mockImplementation(() => ({
          limit: jest.fn().mockResolvedValue([]),
        })),
      })),
    })),
  };
});

jest.mock('../models/Registration', () => {
  return {
    find: jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue([]),
      sort: jest.fn().mockResolvedValue([]),
    })),
    findOne: jest.fn().mockResolvedValue(null),
    findOneAndUpdate: jest.fn().mockResolvedValue(true),
    countDocuments: jest.fn().mockResolvedValue(10),
    create: jest.fn().mockResolvedValue({
      _id: '60d0fe4f5311236168a109d0',
      registrationStatus: 'confirmed',
    }),
  };
});

describe('AI Hub API Endpoints Integration Tests', () => {
  let authToken;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.AI_PROVIDER = 'mock';
    process.env.JWT_SECRET = 'test-secret-key-12345';
    authToken = jwt.sign({ id: '60d0fe4f5311236168a109ca', role: 'faculty' }, process.env.JWT_SECRET);
  });

  test('GET /api/health returns API status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/ai/poster/generate generates poster and metadata', async () => {
    const res = await request(app)
      .post('/api/ai/poster/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        eventName: 'AI Hackathon 2026',
        category: 'Technical',
        designStyle: 'cyberpunk',
        posterSize: '1024x1024',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.imageUrl).toBeDefined();
    expect(res.body.data.style).toBe('cyberpunk');
  });

  test('POST /api/ai/event/description returns structured descriptions', async () => {
    const res = await request(app)
      .post('/api/ai/event/description')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        eventName: 'Neural Network Sprint',
        category: 'Technical',
        targetAudience: 'Students',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.short_description).toBeDefined();
    expect(res.body.data.long_description).toBeDefined();
    expect(Array.isArray(res.body.data.highlights)).toBe(true);
  });

  test('POST /api/ai/email/generate returns structured email templates', async () => {
    const res = await request(app)
      .post('/api/ai/email/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        emailType: 'invitation',
        eventTitle: 'Neural Network Sprint',
        recipientType: 'all_students',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subject).toBeDefined();
    expect(res.body.data.html_body).toBeDefined();
    expect(res.body.data.plain_text).toBeDefined();
  });

  test('POST /api/ai/email/send rejects dispatch without explicit confirmation', async () => {
    const res = await request(app)
      .post('/api/ai/email/send')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        subject: 'Reminder',
        htmlBody: '<p>Hello</p>',
        confirmSend: false,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Explicit user confirmation');
  });

  test('POST /api/ai/email/send succeeds when explicit confirmation is provided', async () => {
    const res = await request(app)
      .post('/api/ai/email/send')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        campaignName: 'Hackathon Alert',
        subject: 'Reminder: Hackathon Tomorrow',
        htmlBody: '<p>Join us at 9 AM!</p>',
        plainText: 'Join us at 9 AM!',
        recipientType: 'faculty',
        confirmSend: true,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.campaign.status).toBe('completed');
  });

  test('POST /api/ai/chat returns contextual answer and suggested queries', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        message: 'What technical events are happening?',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.answer).toBeDefined();
    expect(Array.isArray(res.body.suggestedQueries)).toBe(true);
  });

  test('POST /api/ai/feedback/analyze produces sentiment report', async () => {
    const res = await request(app)
      .post('/api/ai/feedback/analyze')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        eventId: '60d0fe4f5311236168a109c1',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overallSentiment).toBeDefined();
    expect(res.body.data.sentimentScore).toBeDefined();
  });

  test('GET /api/ai/recommendations returns explainable event recommendations', async () => {
    const res = await request(app)
      .get('/api/ai/recommendations')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.recommendations)).toBe(true);
  });

  test('GET /api/ai/prompts lists all registered prompts', async () => {
    const res = await request(app)
      .get('/api/ai/prompts')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.prompts.length).toBeGreaterThanOrEqual(6);
  });
});
