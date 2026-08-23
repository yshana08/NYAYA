// Offline complaint draft — plain template, used when Claude isn't configured or fails.
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function templateComplaint({ complaintType, platform, additional, caseRecord }) {
  const subject = `Subject: Appeal Regarding ${complaintType}`;
  const platformLine = platform ? ` on ${platform}` : "";
  const amountLine = caseRecord.answers && caseRecord.answers.pendingAmount
    ? `\n\nI also have approximately ₹${Number(caseRecord.answers.pendingAmount).toLocaleString("en-IN")} in pending earnings.`
    : "";
  const extraLine = additional ? `\n\n${additional}` : "";

  const body =
    `Dear Support Team,\n\n` +
    `I am writing to formally raise a ${complaintType.toLowerCase()} case${platformLine}, filed as case ${caseRecord.id}.\n\n` +
    `This was first reported on ${formatDate(caseRecord.createdAt)}. ${caseRecord.text}` +
    amountLine + extraLine +
    `\n\nI request that you kindly review this matter and respond with next steps.\n\nRegards,\nWorker`;

  return { subject, body };
}

module.exports = { templateComplaint };
