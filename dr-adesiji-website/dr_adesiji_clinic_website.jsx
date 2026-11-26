import React, { useEffect, useState } from "react";

// DrAdesijiClinic.jsx
// Single-file React component (Tailwind CSS expected in the host project)
// - Virtual "Rooms" (tabs) for Patient Intake form and Online Booking
// - Client-side validation and localStorage persistence
// - Example fetch() calls commented where you can wire to a backend at /api

export default function DrAdesijiClinic() {
  // patient intake store
  const [patients, setPatients] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("da_patients")) || [];
    } catch (e) {
      return [];
    }
  });

  // bookings store
  const [bookings, setBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("da_bookings")) || [];
    } catch (e) {
      return [];
    }
  });

  // UI state
  const [activeRoom, setActiveRoom] = useState("intake");
  const [intake, setIntake] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    phone: "",
    address: "",
    insurance: "",
    symptoms: "",
    emergencyContact: "",
    consent: false,
  });

  const [booking, setBooking] = useState({
    patientEmail: "",
    service: "General Consultation",
    date: "",
    time: "",
    notes: "",
  });

  const services = [
    "General Consultation",
    "Follow-up",
    "Vaccination",
    "Chronic Care",
    "Telemedicine",
  ];

  useEffect(() => {
    localStorage.setItem("da_patients", JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem("da_bookings", JSON.stringify(bookings));
  }, [bookings]);

  // Simple validation helpers
  function validateIntake() {
    if (!intake.firstName.trim() || !intake.lastName.trim()) return "Please enter full name.";
    if (!intake.dob) return "Please enter date of birth.";
    if (!intake.phone && !intake.email) return "Please provide at least a phone number or email.";
    if (!intake.consent) return "Please confirm consent to collect health information.";
    return null;
  }

  function handleIntakeSubmit(e) {
    e.preventDefault();
    const err = validateIntake();
    if (err) return alert(err);

    const record = { id: Date.now(), ...intake };
    setPatients((p) => [record, ...p]);

    // Example: send to backend
    // fetch('/api/patients', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(record) })
    //   .then(r => r.json()).then(...)

    alert("Patient intake saved. You can now book an appointment from the Booking room.");
    setIntake({
      firstName: "",
      lastName: "",
      dob: "",
      email: "",
      phone: "",
      address: "",
      insurance: "",
      symptoms: "",
      emergencyContact: "",
      consent: false,
    });
    setActiveRoom("booking");
  }

  // Booking validation: ensure no conflicting booking for same time
  function validateBooking() {
    if (!booking.patientEmail) return "Enter the patient email so we can find the patient record.";
    if (!booking.date) return "Choose a date.";
    if (!booking.time) return "Choose a time.";

    const conflict = bookings.find((b) => b.date === booking.date && b.time === booking.time);
    if (conflict) return `Time slot taken by ${conflict.patientEmail}`;
    return null;
  }

  function handleBookingSubmit(e) {
    e.preventDefault();
    const err = validateBooking();
    if (err) return alert(err);

    const bookingRecord = { id: Date.now(), ...booking };
    setBookings((b) => [bookingRecord, ...b]);

    // Example: send to backend
    // fetch('/api/bookings', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(bookingRecord) })
    //   .then(r => r.json()).then(...)

    alert(`Booking confirmed for ${booking.patientEmail} on ${booking.date} at ${booking.time}`);

    setBooking((prev) => ({ ...prev, date: "", time: "", notes: "" }));
  }

  function findPatientByEmail(email) {
    return patients.find((p) => p.email === email) || null;
  }

  function cancelBooking(id) {
    if (!confirm("Cancel this booking?")) return;
    setBookings((b) => b.filter((x) => x.id !== id));
  }

  // Quick calendar helper to produce time slots (09:00 - 17:00 every 30 minutes)
  function generateTimeSlots() {
    const slots = [];
    for (let h = 9; h < 17; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
    slots.push("17:00");
    return slots;
  }

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      <header className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Dr. Adesiji Clinic</h1>
            <p className="text-sm text-gray-600">Online patient intake & booking — secure · private · available 24/7</p>
          </div>
          <div className="text-right text-sm">
            <div>Contact: +1(226)6632548</div>
            <div>Email: dr.adesiji@yahoo.com</div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <nav className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-lg ${activeRoom === "intake" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveRoom("intake")}
          >
            Room 1 — Patient Intake
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${activeRoom === "booking" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveRoom("booking")}
          >
            Room 2 — Book Appointment
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${activeRoom === "mybookings" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveRoom("mybookings")}
          >
            Room 3 — My Bookings
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${activeRoom === "admin" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveRoom("admin")}
          >
            Admin — Clinic Dashboard
          </button>
        </nav>

        {/* Room 1: Intake Form */}
        {activeRoom === "intake" && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Patient Intake Form</h2>
            <p className="text-sm text-gray-600 mb-4">Fill out this form to register as a patient. Completing this will let you book appointments faster.</p>

            <form onSubmit={handleIntakeSubmit} className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <input required value={intake.firstName} onChange={(e) => setIntake({ ...intake, firstName: e.target.value })} placeholder="First name" className="p-3 rounded border" />
                <input required value={intake.lastName} onChange={(e) => setIntake({ ...intake, lastName: e.target.value })} placeholder="Last name" className="p-3 rounded border" />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <input type="date" value={intake.dob} onChange={(e) => setIntake({ ...intake, dob: e.target.value })} className="p-3 rounded border" />
                <input type="email" value={intake.email} onChange={(e) => setIntake({ ...intake, email: e.target.value })} placeholder="Email" className="p-3 rounded border" />
                <input value={intake.phone} onChange={(e) => setIntake({ ...intake, phone: e.target.value })} placeholder="Phone" className="p-3 rounded border" />
              </div>

              <input value={intake.address} onChange={(e) => setIntake({ ...intake, address: e.target.value })} placeholder="Home address" className="p-3 rounded border" />

              <div className="grid md:grid-cols-2 gap-4">
                <input value={intake.insurance} onChange={(e) => setIntake({ ...intake, insurance: e.target.value })} placeholder="Insurance provider (optional)" className="p-3 rounded border" />
                <input value={intake.emergencyContact} onChange={(e) => setIntake({ ...intake, emergencyContact: e.target.value })} placeholder="Emergency contact" className="p-3 rounded border" />
              </div>

              <textarea value={intake.symptoms} onChange={(e) => setIntake({ ...intake, symptoms: e.target.value })} placeholder="Brief medical history / current symptoms" className="p-3 rounded border h-24" />

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={intake.consent} onChange={(e) => setIntake({ ...intake, consent: e.target.checked })} />
                <span className="text-sm">I consent to the collection and storage of my health information by Dr. Adesiji Clinic (required).</span>
              </label>

              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">Submit & Register</button>
                <button type="button" onClick={() => { setIntake({ firstName: '', lastName: '', dob: '', email: '', phone: '', address: '', insurance: '', symptoms: '', emergencyContact: '', consent: false }); }} className="px-4 py-2 rounded bg-gray-200">Clear</button>
              </div>
            </form>

            <hr className="my-6" />

            <h3 className="text-lg font-medium mb-2">Recently registered patients</h3>
            <div className="space-y-2">
              {patients.length === 0 ? <p className="text-sm text-gray-500">No patients yet.</p> : (
                patients.slice(0, 6).map((p) => (
                  <div key={p.id} className="p-3 rounded border bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{p.firstName} {p.lastName}</div>
                        <div className="text-sm text-gray-600">{p.email || p.phone} · DOB: {p.dob}</div>
                      </div>
                      <div className="text-sm">ID: {String(p.id).slice(-6)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Room 2: Booking */}
        {activeRoom === "booking" && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Book an Appointment</h2>
            <p className="text-sm text-gray-600 mb-4">Patients can book anytime. Choose a date and an available time slot.</p>

            <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 gap-4">
              <label className="text-sm">Your registered email (we'll look up your patient record)</label>
              <div className="flex gap-2">
                <input value={booking.patientEmail} onChange={(e) => setBooking({ ...booking, patientEmail: e.target.value })} placeholder="patient@example.com" className="p-3 rounded border flex-1" />
                <button type="button" onClick={() => {
                  const p = findPatientByEmail(booking.patientEmail);
                  if (p) alert(`Found patient: ${p.firstName} ${p.lastName}`);
                  else alert('No patient found — please register in Room 1');
                }} className="px-4 py-2 rounded bg-gray-200">Find</button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <select value={booking.service} onChange={(e) => setBooking({ ...booking, service: e.target.value })} className="p-3 rounded border">
                  {services.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <input type="date" value={booking.date} onChange={(e) => setBooking({ ...booking, date: e.target.value })} className="p-3 rounded border" />
              </div>

              <label className="text-sm">Choose a time slot</label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-auto p-2 rounded border bg-white">
                {timeSlots.map((t) => {
                  const taken = bookings.find((b) => b.date === booking.date && b.time === t);
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setBooking({ ...booking, time: t })}
                      className={`p-2 rounded text-sm ${booking.time === t ? 'bg-indigo-600 text-white' : taken ? 'bg-gray-200 line-through text-gray-500' : 'bg-gray-100'}`}
                      disabled={!!taken}
                    >
                      {t}{taken ? ' ✓' : ''}
                    </button>
                  );
                })}
              </div>

              <textarea value={booking.notes} onChange={(e) => setBooking({ ...booking, notes: e.target.value })} placeholder="Notes for the clinician (optional)" className="p-3 rounded border h-24" />

              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Confirm Booking</button>
                <button type="button" onClick={() => setBooking({ patientEmail: "", service: "General Consultation", date: "", time: "", notes: "" })} className="px-4 py-2 rounded bg-gray-200">Clear</button>
              </div>
            </form>

            <hr className="my-6" />

            <h3 className="text-lg font-medium mb-2">Next 10 bookings</h3>
            <div className="space-y-2">
              {bookings.length === 0 ? <p className="text-sm text-gray-500">No bookings yet.</p> : (
                bookings.slice(0, 10).map((b) => (
                  <div key={b.id} className="p-3 rounded border bg-gray-50 flex justify-between">
                    <div>
                      <div className="font-semibold">{b.patientEmail} — {b.service}</div>
                      <div className="text-sm text-gray-600">{b.date} · {b.time}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => cancelBooking(b.id)} className="text-sm px-3 py-1 rounded bg-red-500 text-white">Cancel</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Room 3: My Bookings */}
        {activeRoom === "mybookings" && (
          <section>
            <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
            <p className="text-sm text-gray-600 mb-4">Enter your email to view or cancel your bookings.</p>

            <EmailBookingsView patients={patients} bookings={bookings} onCancel={cancelBooking} />
          </section>
        )}

        {/* Admin Dashboard */}
        {activeRoom === "admin" && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
            <p className="text-sm text-gray-600 mb-4">Overview of patients and bookings. (This is client-side demo — connect to a real backend for production.)</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded border bg-gray-50">
                <h4 className="font-medium mb-2">Total patients</h4>
                <div className="text-3xl font-bold">{patients.length}</div>
              </div>
              <div className="p-4 rounded border bg-gray-50">
                <h4 className="font-medium mb-2">Upcoming bookings</h4>
                <div className="text-3xl font-bold">{bookings.length}</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-2">All patients</h4>
              <div className="space-y-2">
                {patients.map((p) => (
                  <div key={p.id} className="p-3 rounded border bg-white flex justify-between">
                    <div>
                      <div className="font-semibold">{p.firstName} {p.lastName}</div>
                      <div className="text-sm text-gray-600">{p.email || p.phone}</div>
                    </div>
                    <div className="text-sm">DOB: {p.dob}</div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

      </main>

      <footer className="max-w-4xl mx-auto mt-6 text-center text-sm text-gray-500">
        <div>© {new Date().getFullYear()} Dr. Adesiji Clinic — Privacy & terms apply. This demo stores data in your browser localStorage.</div>
      </footer>
    </div>
  );
}

function EmailBookingsView({ patients, bookings, onCancel }) {
  const [email, setEmail] = useState("");
  const [results, setResults] = useState([]);

  function lookup() {
    const res = bookings.filter((b) => b.patientEmail.toLowerCase() === email.toLowerCase());
    setResults(res);
  } 

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input placeholder="dr.adesiji@yahoo.com" className="p-3 rounded border flex-1" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={lookup} className="px-4 py-2 rounded bg-gray-200">Lookup</button>
      </div>

      {results.length === 0 ? <p className="text-sm text-gray-500">No bookings found for this email.</p> : (
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.id} className="p-3 rounded border bg-gray-50 flex justify-between">
              <div>
                <div className="font-semibold">{r.service}</div>
                <div className="text-sm text-gray-600">{r.date} · {r.time}</div>
              </div>
              <div>
                <button onClick={() => onCancel(r.id)} className="px-3 py-1 rounded bg-red-500 text-white text-sm">Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
