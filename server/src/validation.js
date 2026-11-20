const sources = ["Website", "Referral", "LinkedIn", "Cold Call", "Other"];
const statuses = ["New", "Contacted", "Qualified", "Lost"];

export function validateLead(body) {
  const errors = {};
  const fields = ["name", "email", "phone", "company", "source", "status"];
  for (const field of fields) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      errors[field] = `${field[0].toUpperCase()}${field.slice(1)} is required`;
    }
  }
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    errors.email = "Enter a valid email address";
  }
  if (body.source && !sources.includes(body.source)) errors.source = "Choose a valid source";
  if (body.status && !statuses.includes(body.status)) errors.status = "Choose a valid status";
  return errors;
}
