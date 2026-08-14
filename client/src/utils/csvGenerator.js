/**
 * Compiles user data into a formatted CSV report that opens cleanly in Excel.
 * @param {Object} userData - The user data payload returned from the backend export API.
 * @param {string} contentSelection - What data to export ('all', 'assessments', 'notes').
 */
export const generateCSVReport = (userData, contentSelection = 'all') => {
  const csvRows = [];
  
  // Helper to escape CSV cell values
  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '';
    let stringVal = String(val);
    // Replace double quotes with two double quotes
    stringVal = stringVal.replace(/"/g, '""');
    // If the value contains commas, newlines, or quotes, wrap it in double quotes
    if (stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('\r') || stringVal.includes('"')) {
      return `"${stringVal}"`;
    }
    return stringVal;
  };

  // 1. Profile Summary (Include basic headers if "all" is selected)
  if (contentSelection === 'all') {
    csvRows.push(['ACCOUNT PROFILE SUMMARY']);
    csvRows.push(['Field', 'Value']);
    csvRows.push(['Name', userData.account?.name || 'N/A']);
    csvRows.push(['Email', userData.account?.email || 'N/A']);
    csvRows.push(['Streak Mode', `${userData.profile?.streakType || 'Daily'} Streak`]);
    csvRows.push(['Age Group', userData.profile?.ageGroup || 'N/A']);
    csvRows.push(['Joined On', userData.account?.createdAt ? new Date(userData.account.createdAt).toLocaleDateString() : 'N/A']);
    csvRows.push(['Report Generated At', new Date(userData.exportedAt || new Date()).toLocaleString()]);
    csvRows.push([]); // empty line separator
  }

  // 2. Custom Attributes (Only relevant if exporting all or assessments)
  if ((contentSelection === 'all' || contentSelection === 'assessments') && userData.customAttributes && userData.customAttributes.length > 0) {
    csvRows.push(['CUSTOM ATTRIBUTES CREATED']);
    csvRows.push(['Attribute Name', 'Category', 'Description']);
    userData.customAttributes.forEach(attr => {
      csvRows.push([
        attr.name,
        attr.category,
        attr.description || 'N/A'
      ]);
    });
    csvRows.push([]); // empty line separator
  }

  // 3. Assessments
  if (contentSelection === 'all' || contentSelection === 'assessments') {
    csvRows.push(['SELF-ASSESSMENT HISTORY']);
    if (userData.assessments && userData.assessments.length > 0) {
      csvRows.push(['Date', 'Attribute Name', 'Score', 'Effort Level', 'Notes / Reflection']);
      userData.assessments.forEach(assess => {
        csvRows.push([
          new Date(assess.assessmentDate).toLocaleDateString(),
          assess.attributeName,
          `${assess.alignmentScore} / 5`,
          assess.effortLevel || 'N/A',
          assess.personalNote || ''
        ]);
      });
    } else {
      csvRows.push(['No assessments recorded yet.']);
    }
    csvRows.push([]); // empty line separator
  }

  // 4. Journal Notes
  if (contentSelection === 'all' || contentSelection === 'notes') {
    csvRows.push(['REFLECTIVE JOURNAL NOTES']);
    if (userData.journalNotes && userData.journalNotes.length > 0) {
      csvRows.push(['Date', 'Attribute Name', 'Journal Entry Content']);
      userData.journalNotes.forEach(note => {
        csvRows.push([
          new Date(note.createdAt).toLocaleDateString(),
          note.attributeName,
          note.content
        ]);
      });
    } else {
      csvRows.push(['No journal notes recorded yet.']);
    }
  }

  // Convert to CSV string
  const csvContent = csvRows
    .map(row => row.map(cell => escapeCSV(cell)).join(','))
    .join('\n');

  // Trigger download with UTF-8 BOM so Excel opens it with correct encoding
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `character-coach-export-${userData.account?.id || 'data'}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
