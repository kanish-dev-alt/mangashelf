
CREATE TABLE IF NOT EXISTS manga_series (
    series_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    illustrator VARCHAR(255),
    publisher VARCHAR(255),
    genre VARCHAR(255),
    description TEXT,
    cover_image_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS manga_volumes (
    volume_id INT AUTO_INCREMENT PRIMARY KEY,
    series_id INT NOT NULL,
    volume_number INT NOT NULL,
    edition VARCHAR(100),
    isbn VARCHAR(20),
    language VARCHAR(100),
    publication_date DATE,
    total_copies INT NOT NULL DEFAULT 0,
    available_copies INT NOT NULL DEFAULT 0,
    FOREIGN KEY (series_id)
        REFERENCES manga_series(series_id)
        ON DELETE CASCADE
);

