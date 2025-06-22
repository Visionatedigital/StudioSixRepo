"use client";
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useParams } from 'next/navigation';
import { Icon } from '@/components/Icons';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function ProjectDashboardPage() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editClient, setEditClient] = useState(false);
  const [editMilestones, setEditMilestones] = useState(false);
  const [clientFields, setClientFields] = useState<any>({});
  const [milestones, setMilestones] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      if (!params || !params.projectId) {
        setProject(null);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/projects/${params.projectId}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
          setClientFields({
            clientName: data.clientName || '',
            clientEmail: data.clientEmail || '',
            clientPhone: data.clientPhone || '',
            clientAddress: data.clientAddress || '',
          });
          setMilestones(data.milestones || []);
        } else {
          setProject(null);
        }
      } catch (e) {
        setProject(null);
      }
      setLoading(false);
    };
    fetchProject();
  }, [params]);

  const saveClientInfo = async () => {
    if (!params || !params.projectId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${params.projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientFields),
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setEditClient(false);
      } else {
        alert('Failed to update client info');
      }
    } catch (e) {
      alert('Failed to update client info');
    }
    setSaving(false);
  };

  const saveMilestones = async () => {
    if (!params || !params.projectId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${params.projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestones }),
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setEditMilestones(false);
      } else {
        alert('Failed to update milestones');
      }
    } catch (e) {
      alert('Failed to update milestones');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="Client Hub">
        <div className="p-6 text-center text-gray-400">Loading project details...</div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout currentPage="Client Hub">
        <div className="p-6 text-center text-gray-400">Project not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="Client Hub">
      <div className="p-0">
        {/* Banner with thumbnail and title */}
        <div className="w-full h-36 md:h-48 bg-gray-200 flex items-end justify-start relative rounded-b-2xl overflow-hidden mb-8">
          {project.thumbnail ? (
            <img
              src={project.thumbnail}
              alt={project.name}
              className="object-cover w-full h-full absolute inset-0"
            />
          ) : (
            <div className="text-gray-400 text-2xl w-full h-full flex items-center justify-center absolute inset-0">No Project Banner</div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {/* Project title */}
          <div className="relative z-10 p-6 pb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{project.name}</h1>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Top 3 containers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Client Info */}
            <div className="bg-white rounded-2xl p-6 shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-lg">Client Info</h2>
                {!editClient && (
                  <button onClick={() => setEditClient(true)} title="Edit"><Icon name="edit" size={18} /></button>
                )}
              </div>
              {editClient ? (
                <form className="space-y-2" onSubmit={e => { e.preventDefault(); saveClientInfo(); }}>
                  <div><label className="block text-xs">Name:</label><input className="w-full border rounded px-2 py-1" value={clientFields.clientName} onChange={e => setClientFields((f: any) => ({ ...f, clientName: e.target.value }))} /></div>
                  <div><label className="block text-xs">Email:</label><input className="w-full border rounded px-2 py-1" value={clientFields.clientEmail} onChange={e => setClientFields((f: any) => ({ ...f, clientEmail: e.target.value }))} /></div>
                  <div><label className="block text-xs">Phone:</label><input className="w-full border rounded px-2 py-1" value={clientFields.clientPhone} onChange={e => setClientFields((f: any) => ({ ...f, clientPhone: e.target.value }))} /></div>
                  <div><label className="block text-xs">Address:</label><input className="w-full border rounded px-2 py-1" value={clientFields.clientAddress} onChange={e => setClientFields((f: any) => ({ ...f, clientAddress: e.target.value }))} /></div>
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="bg-purple-600 text-white px-3 py-1 rounded" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                    <button type="button" className="bg-gray-200 px-3 py-1 rounded" onClick={() => setEditClient(false)} disabled={saving}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div>Name: {project.clientName}</div>
                  <div>Email: {project.clientEmail}</div>
                  <div>Phone: {project.clientPhone}</div>
                  <div>Address: {project.clientAddress}</div>
                </>
              )}
            </div>
            {/* Payments */}
            <div className="bg-white rounded-2xl p-6 shadow">
              <h2 className="font-semibold text-lg mb-2">Payments</h2>
              <ul className="space-y-1">
                {project.payments && project.payments.map((p: any) => (
                  <li key={p.id} className="flex justify-between">
                    <span>UGX {p.amount.toLocaleString()}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Feedback & Approvals */}
            <div className="bg-white rounded-2xl p-6 shadow">
              <h2 className="font-semibold text-lg mb-2">Feedback & Approvals</h2>
              <ul className="space-y-1">
                {project.feedback && project.feedback.map((f: any) => (
                  <li key={f.id} className="mb-2">
                    <div className="text-sm font-medium">{f.author} <span className="text-xs text-gray-400">({f.date})</span></div>
                    <div className="text-gray-700">{f.message}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Project Timeline below */}
          <div className="bg-white rounded-2xl p-6 shadow fc-purple">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Project Timeline</h2>
              {!editMilestones && (
                <button onClick={() => setEditMilestones(true)} title="Edit"><Icon name="edit" size={18} /></button>
              )}
            </div>
            {/* Calendar integration */}
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              height="auto"
              events={
                project.milestones && Array.isArray(project.milestones)
                  ? project.milestones.filter((m: any) => m && m.date).map((m: any, i: number) => ({
                      title: m.title || m,
                      date: m.date || undefined,
                    }))
                  : []
              }
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              selectable={true}
              editable={false}
              dayMaxEvents={true}
              buttonText={{
                today: 'today',
                month: 'month',
                week: 'week',
                day: 'day',
              }}
              customButtons={{}}
              contentHeight={"auto"}
            />
            <style jsx global>{`
              .fc-purple .fc-button, .fc-purple .fc-button-primary {
                background-color: #9333ea !important;
                border: none !important;
                color: #fff !important;
                box-shadow: none !important;
                transition: background 0.2s;
              }
              .fc-purple .fc-button:hover, .fc-purple .fc-button-primary:hover {
                background-color: #7c22ce !important;
              }
              .fc-purple .fc-button-active, .fc-purple .fc-button-primary:active, .fc-purple .fc-button-primary.fc-button-active {
                background-color: #7c22ce !important;
                color: #fff !important;
              }
              .fc-purple .fc-button:focus {
                outline: none !important;
                box-shadow: 0 0 0 2px #c4b5fd !important;
              }
            `}</style>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}