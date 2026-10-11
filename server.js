
require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./config/db');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Test database connection
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        DATABASE() AS database_name,
        VERSION() AS mysql_version
    `);

    res.json({
      status: 'Connected',
      database: rows[0].database_name,
      mysqlVersion: rows[0].mysql_version
    });
  } catch (error) {
    console.error('Database error:', error.code || error.message);

    res.status(500).json({
      status: 'Database connection failed',
      error: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// Get all manga series and inventory totals
app.get('/api/manga', async (req, res) => {
  try {
    // Temporary diagnostic: check the database and record count
    const [dbCheck] = await pool.query(`
      SELECT
        DATABASE() AS database_name,
        COUNT(*) AS manga_count
      FROM manga_series
    `);

    console.log('Manga API database check:', dbCheck);

    // Fetch manga and volume totals
    const [rows] = await pool.query(`
      SELECT
        s.series_id,
        s.title,
        s.author,
        s.illustrator,
        s.publisher,
        s.genre,
        s.description,
        s.cover_image_url,
        COUNT(v.volume_id) AS total_volumes,
        COALESCE(SUM(v.total_copies), 0) AS total_copies,
        COALESCE(SUM(v.available_copies), 0) AS available_copies
      FROM manga_series AS s
      LEFT JOIN manga_volumes AS v
        ON s.series_id = v.series_id
      GROUP BY
        s.series_id,
        s.title,
        s.author,
        s.illustrator,
        s.publisher,
        s.genre,
        s.description,
        s.cover_image_url
      ORDER BY s.series_id
    `);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Failed to fetch manga:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch manga records'
    });
  }
});

// Get volumes belonging to one manga series
app.get('/api/manga/:id/volumes', async (req, res) => {
  try {
    const seriesId = Number(req.params.id);

    if (!Number.isInteger(seriesId) || seriesId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid manga series ID'
      });
    }

    const [rows] = await pool.execute(`
      SELECT
        volume_id,
        series_id,
        volume_number,
        edition,
        isbn,
        language,
        publication_date,
        total_copies,
        available_copies
      FROM manga_volumes
      WHERE series_id = ?
      ORDER BY volume_number
    `, [seriesId]);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Failed to fetch volumes:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch volume records'
    });
  }
});

// Handle unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MangaShelf server running on port ${PORT}`);
});
