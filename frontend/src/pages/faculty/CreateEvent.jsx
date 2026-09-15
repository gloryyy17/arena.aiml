import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

const navItems = [
  { label: 'My Events', to: '/dashboard' },
  { label: 'Create Event', to: '/dashboard/create' },
];

const inputClass = "w-full mb-4 px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-transparent outline-none focus:border-accent transition-colors";
const labelClass = "block text-xs font-mono uppercase tracking-wider opacity-60 mb-1";

const CreateEvent = () => {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Technical', department: '',
    venue: '', startDate: '', endDate: '', registrationDeadline: '',
    maxParticipants: 50, fee: 0,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'maxParticipants' || name === 'fee' ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/events', form);
      setSuccess('Event created as draft! Head to My Events to submit it for approval.');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <h1 className="font-display text-2xl font-semibold mb-1">Create Event</h1>
      <p className="text-sm opacity-60 mb-6">This saves as a draft — submit it for approval afterwards.</p>

      {error && <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2 mb-4">{error}</p>}
      {success && <p className="text-sm text-green-600 bg-green-500/10 rounded-lg px-3 py-2 mb-4">{success}</p>}

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="max-w-2xl bg-bg-light dark:bg-[#1A1A1E] border border-border-light dark:border-border-dark rounded-2xl p-8"
      >
        <label className={labelClass}>Event Title</label>
        <input name="title" value={form.title} onChange={handleChange} required className={inputClass} />

        <label className={labelClass}>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className={inputClass} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              <option>Technical</option>
              <option>Cultural</option>
              <option>Sports</option>
              <option>Workshop</option>
              <option>Seminar</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Department</label>
            <input name="department" value={form.department} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <label className={labelClass}>Venue</label>
        <input name="venue" value={form.venue} onChange={handleChange} required className={inputClass} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Start Date</label>
            <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>End Date</label>
            <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} required className={inputClass} />
          </div>
        </div>

        <label className={labelClass}>Registration Deadline</label>
        <input type="datetime-local" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} required className={inputClass} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Max Participants</label>
            <input type="number" name="maxParticipants" value={form.maxParticipants} onChange={handleChange} min={1} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fee (₹, 0 = free)</label>
            <input type="number" name="fee" value={form.fee} onChange={handleChange} min={0} className={inputClass} />
          </div>
        </div>

        <button type="submit" className="w-full py-2.5 rounded-full bg-accent text-white font-medium hover:opacity-90 transition-opacity mt-2">
          Save as Draft
        </button>
      </motion.form>
    </DashboardLayout>
  );
};

export default CreateEvent;