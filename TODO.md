# TODO: Implement Consistent Comments Section in Admin Dashboard

## Overview
Develop a comments section UI where the comment count badge always matches the number of comments shown when the section is opened. Ensure immediate updates for count and list on add/delete.

## Steps
- [ ] Modify openModal to fetch latest comments and update comment count in resources list
- [ ] Flatten comments tree into a single list for display (including replies)
- [ ] Update modal UI to show all comments (flattened) and match the count
- [ ] Add functionality to add new comments in the modal
- [ ] Update local comments state and comment count immediately after adding a comment
- [ ] Update local comments state and comment count immediately after deleting a comment
- [ ] Ensure count always reflects the displayed comments (flattened total)

## Dependent Files
- frontend/src/pages/AdminDashboard.jsx (main changes)
- backend/controllers/resourceControllers.js (modify getComments if needed for flattening)
- backend/routes/resources.js (if needed)

## Followup
- Test the modal opening, adding, deleting comments
- Verify count matches displayed comments
- Ensure no errors in console
