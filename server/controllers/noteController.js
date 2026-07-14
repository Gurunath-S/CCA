const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all notes for a character attribute
exports.getNotes = async (req, res) => {
  const { characterId } = req.params;
  const userId = req.user.id;

  try {
    const notes = await prisma.personalNote.findMany({
      where: {
        userId,
        characterId
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ notes });
  } catch (err) {
    console.error('getNotes error:', err);
    res.status(500).json({ message: 'Server error retrieving notes' });
  }
};

// Create or update a note
// If noteId is provided, we update the existing note. Otherwise, we create a new note.
exports.upsertNote = async (req, res) => {
  const { noteId, characterId, content } = req.body;
  const userId = req.user.id;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Note content cannot be empty' });
  }

  try {
    if (noteId) {
      // Update existing note
      const existingNote = await prisma.personalNote.findUnique({
        where: { id: noteId }
      });

      if (!existingNote || existingNote.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized or note not found' });
      }

      const updatedNote = await prisma.personalNote.update({
        where: { id: noteId },
        data: { content: content.trim() }
      });

      return res.status(200).json({
        message: 'Note updated successfully',
        note: updatedNote
      });
    } else {
      // Create new note
      if (!characterId) {
        return res.status(400).json({ message: 'Character ID is required to create a note' });
      }

      const newNote = await prisma.personalNote.create({
        data: {
          userId,
          characterId,
          content: content.trim()
        }
      });

      return res.status(201).json({
        message: 'Note created successfully',
        note: newNote
      });
    }
  } catch (err) {
    console.error('upsertNote error:', err);
    res.status(500).json({ message: 'Failed to save note' });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user.id;

  try {
    const existingNote = await prisma.personalNote.findUnique({
      where: { id: noteId }
    });

    if (!existingNote || existingNote.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized or note not found' });
    }

    await prisma.personalNote.delete({
      where: { id: noteId }
    });

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('deleteNote error:', err);
    res.status(500).json({ message: 'Failed to delete note' });
  }
};
