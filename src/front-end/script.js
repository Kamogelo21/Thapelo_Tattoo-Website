const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://thaps-ink.onrender.com";

const form = document.getElementById('bookingForm');
const dateInput = document.getElementById('date');
const message = document.getElementById('formMessage');

dateInput.addEventListener('change', async () => {
  const date = dateInput.value;

  const res = await fetch(
    `${BACKEND_URL}/availability?date=${date}`
  );

  const data = await res.json();

  message.textContent = data.available
    ? 'Date is available ✅'
    : 'Sorry, this date is already booked ❌';
});


form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const booking = {
    name: form.name.value,
    email: form.email.value,
    date: form.date.value,
    details: form.details.value
  };

  const res = await fetch(`${BACKEND_URL}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  });
  const data = await res.json();
  message.textContent = data.message;
  if (res.ok) form.reset();

// ===========================
// Booking Form Confirmation
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("bookingForm");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Optionally send data to backend here
      const confirmation = document.createElement("p");
      confirmation.classList.add("confirmation");
      confirmation.textContent = "Your booking has been sent successfully!";
      form.appendChild(confirmation);

      // Fade in message
      confirmation.style.display = "block";
      confirmation.style.opacity = 0;
      setTimeout(() => {
        confirmation.style.transition = "opacity 0.5s";
        confirmation.style.opacity = 1;
      }, 100);

      // Clear form fields
      form.reset();

      // Hide after 5 seconds
      setTimeout(() => {
        confirmation.style.opacity = 0;
        setTimeout(() => confirmation.remove(), 500);
      }, 5000);
    });
  });
});
