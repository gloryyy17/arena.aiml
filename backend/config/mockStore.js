const bcrypt = require('bcryptjs');

class MockStore {
  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.registrations = new Map();
    this.conversations = new Map();
    this._seed();
  }

  _seed() {
    // Seed standard demo users
    const defaultPasswordHash = bcrypt.hashSync('password123', 10);

    const demoUsers = [
      {
        _id: 'mock-user-student-1',
        name: 'Aarav Sharma',
        email: 'student@arena.aiml',
        password: defaultPasswordHash,
        role: 'student',
        department: 'AI & Data Science',
        studentId: 'AIML-2026-042',
        isActive: true,
        createdAt: new Date(),
      },
      {
        _id: 'mock-user-faculty-1',
        name: 'Dr. Alan Turing',
        email: 'faculty@arena.aiml',
        password: defaultPasswordHash,
        role: 'faculty',
        department: 'AI & Data Science',
        employeeId: 'FAC-AIML-001',
        isActive: true,
        createdAt: new Date(),
      },
      {
        _id: 'mock-user-admin-1',
        name: 'Dean of Academics',
        email: 'admin@arena.aiml',
        password: defaultPasswordHash,
        role: 'admin',
        department: 'Administration',
        employeeId: 'ADM-001',
        isActive: true,
        createdAt: new Date(),
      },
    ];

    for (const u of demoUsers) {
      this.users.set(u.email.toLowerCase(), u);
      this.users.set(u._id, u);
    }

    // Seed standard published events
    const demoEvents = [
      {
        _id: 'sample-ai-hackathon',
        title: 'AI Hackathon 2026',
        description: '24-hour build sprint for AI enthusiasts across departments. Compete in teams to build innovative agentic AI workflows and intelligent campus assistants.',
        category: 'Technical',
        department: 'AI & Data Science',
        venue: 'Main Auditorium & Innovation Lab',
        startDate: new Date('2026-09-15T09:00:00.000Z'),
        endDate: new Date('2026-09-16T17:00:00.000Z'),
        registrationDeadline: new Date('2026-10-30T23:59:59.000Z'),
        maxParticipants: 150,
        fee: 0,
        status: 'approved',
        isPublished: true,
        tags: ['AI', 'Hackathon', 'LLM', 'Autonomous Agents'],
        createdBy: { _id: 'mock-user-faculty-1', name: 'Dr. Alan Turing', department: 'AI & Data Science' },
        createdAt: new Date(),
      },
      {
        _id: 'sample-rangmanch',
        title: 'Cultural Fest: Rangmanch',
        description: 'Annual cultural extravaganza featuring inter-departmental dance, music, drama competitions, street plays, and talent showcases.',
        category: 'Cultural',
        department: 'Student Affairs',
        venue: 'Open Air Theatre (OAT)',
        startDate: new Date('2026-09-20T10:00:00.000Z'),
        endDate: new Date('2026-09-21T22:00:00.000Z'),
        registrationDeadline: new Date('2026-10-30T23:59:59.000Z'),
        maxParticipants: 500,
        fee: 0,
        status: 'approved',
        isPublished: true,
        tags: ['Cultural', 'Dance', 'Music', 'Drama', 'Fest'],
        createdBy: { _id: 'mock-user-faculty-1', name: 'Prof. Maya Sen', department: 'Student Affairs' },
        createdAt: new Date(),
      },
      {
        _id: 'sample-ui-ux-design',
        title: 'UI/UX Design Masterclass',
        description: 'Hands-on design thinking, micro-interactions, Figma component architecture, and modern glassmorphic web styling workshop.',
        category: 'Workshop',
        department: 'Computer Science',
        venue: 'Design Studio Lab 3',
        startDate: new Date('2026-09-25T14:00:00.000Z'),
        endDate: new Date('2026-09-25T18:00:00.000Z'),
        registrationDeadline: new Date('2026-10-30T23:59:59.000Z'),
        maxParticipants: 60,
        fee: 50,
        status: 'approved',
        isPublished: true,
        tags: ['UI/UX', 'Figma', 'Product Design'],
        createdBy: { _id: 'mock-user-faculty-1', name: 'Prof. Rohit Sharma', department: 'Computer Science' },
        createdAt: new Date(),
      },
      {
        _id: 'sample-cricket-cup',
        title: 'Inter-College Cricket Cup',
        description: 'Annual 20-over knockout cricket tournament between AIML colleges and engineering institutions.',
        category: 'Sports',
        department: 'Physical Education',
        venue: 'Sports Ground',
        startDate: new Date('2026-10-02T08:00:00.000Z'),
        endDate: new Date('2026-10-05T18:00:00.000Z'),
        registrationDeadline: new Date('2026-10-30T23:59:59.000Z'),
        maxParticipants: 200,
        fee: 0,
        status: 'approved',
        isPublished: true,
        tags: ['Cricket', 'Sports', 'Tournament'],
        createdBy: { _id: 'mock-user-faculty-1', name: 'Coach Vikram Singh', department: 'Physical Education' },
        createdAt: new Date(),
      },
    ];

    for (const ev of demoEvents) {
      this.events.set(ev._id, ev);
    }
  }

  // --- Users ---
  findUserByEmail(email) {
    if (!email) return null;
    return this.users.get(email.toLowerCase().trim()) || null;
  }

  findUserById(id) {
    if (!id) return null;
    return this.users.get(String(id)) || null;
  }

  async createUser(data) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const id = `mock-user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const user = {
      _id: id,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      role: data.role || 'student',
      department: data.department || 'General',
      studentId: data.studentId || '',
      employeeId: data.employeeId || '',
      phone: data.phone || '',
      isActive: true,
      createdAt: new Date(),
    };

    this.users.set(user.email, user);
    this.users.set(user._id, user);
    return user;
  }

  async verifyPassword(user, enteredPassword) {
    if (!user || !user.password || !enteredPassword) return false;
    return bcrypt.compare(enteredPassword, user.password);
  }

  // --- Events ---
  getEvents(query = {}) {
    const { category, department, search } = query;
    let list = Array.from(this.events.values()).filter((e) => e.status === 'approved' && e.isPublished);

    if (category) {
      list = list.filter((e) => e.category?.toLowerCase() === category.toLowerCase());
    }
    if (department) {
      list = list.filter((e) => e.department?.toLowerCase() === department.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          (e.tags && e.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return list.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }

  getEventById(id) {
    if (!id) return null;
    return this.events.get(String(id)) || null;
  }

  getAllEvents() {
    return Array.from(this.events.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getMyEvents(userId) {
    return Array.from(this.events.values())
      .filter((e) => {
        const creatorId = e.createdBy?._id || e.createdBy;
        return String(creatorId) === String(userId);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createEvent(data) {
    const id = `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const event = {
      _id: id,
      ...data,
      status: data.status || 'draft',
      isPublished: Boolean(data.isPublished),
      createdAt: new Date(),
    };
    this.events.set(id, event);
    return event;
  }

  updateEvent(id, updateData) {
    const existing = this.events.get(String(id));
    if (!existing) return null;
    const updated = { ...existing, ...updateData, updatedAt: new Date() };
    this.events.set(String(id), updated);
    return updated;
  }

  deleteEvent(id) {
    return this.events.delete(String(id));
  }

  // --- Registrations ---
  registerStudent(studentId, eventId) {
    const event = this.events.get(String(eventId));
    if (!event) return { error: 'Event not found', status: 404 };
    if (event.status !== 'approved' || !event.isPublished) {
      return { error: 'Event is not open for registration', status: 400 };
    }

    const regKey = `${studentId}_${eventId}`;
    const existing = this.registrations.get(regKey);
    if (existing) {
      if (existing.registrationStatus === 'cancelled') {
        existing.registrationStatus = 'confirmed';
        existing.updatedAt = new Date();
        return { registration: existing };
      }
      return { error: 'You are already registered for this event', status: 400 };
    }

    const regId = `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const registration = {
      _id: regId,
      student: studentId,
      event: event,
      registrationStatus: 'confirmed',
      paymentStatus: (event.fee || 0) > 0 ? 'pending' : 'not_required',
      createdAt: new Date(),
    };

    this.registrations.set(regKey, registration);
    this.registrations.set(regId, registration);
    return { registration };
  }

  getMyRegistrations(studentId) {
    const results = [];
    for (const [key, reg] of this.registrations.entries()) {
      if (key.startsWith('reg-') && String(reg.student) === String(studentId)) {
        results.push(reg);
      }
    }
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  cancelRegistration(regId, studentId) {
    const reg = this.registrations.get(String(regId));
    if (!reg) return { error: 'Registration not found', status: 404 };
    if (String(reg.student) !== String(studentId)) {
      return { error: 'Not authorized to cancel this registration', status: 403 };
    }
    reg.registrationStatus = 'cancelled';
    reg.updatedAt = new Date();
    return { registration: reg };
  }

  // --- Conversations ---
  getConversation(convId, userId) {
    if (!convId) {
      const list = Array.from(this.conversations.values())
        .filter((c) => String(c.user) === String(userId))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      return list[0] || null;
    }
    const c = this.conversations.get(String(convId));
    if (c && String(c.user) === String(userId)) return c;
    return null;
  }

  createConversation(userId, title) {
    const id = `conv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const conv = {
      _id: id,
      user: userId,
      title: title || 'New Conversation',
      messages: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.set(id, conv);
    return conv;
  }

  addMessageToConversation(convId, message) {
    const conv = this.conversations.get(String(convId));
    if (conv) {
      conv.messages.push({ ...message, timestamp: new Date() });
      conv.updatedAt = new Date();
    }
    return conv;
  }

  getUserConversations(userId) {
    return Array.from(this.conversations.values())
      .filter((c) => String(c.user) === String(userId))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 15);
  }
}

const mockStore = new MockStore();

module.exports = mockStore;

