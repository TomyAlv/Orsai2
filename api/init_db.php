<?php
/**
 * Inicializa la base de datos completa con todas las tablas usadas por la app.
 * Ejecutar una vez si la base está vacía o faltan tablas/columnas.
 */
require_once __DIR__ . '/db.php';

function columnExists(PDO $pdo, string $table, string $column): bool {
    $info = $pdo->prepare("PRAGMA table_info($table)");
    $info->execute();
    foreach ($info->fetchAll(PDO::FETCH_ASSOC) as $col) {
        if (($col['name'] ?? '') === $column) {
            return true;
        }
    }
    return false;
}

try {
    $pdo = getConnection();

    // Asegurar directorio de DB (si el host lo permite)
    $dbDir = dirname(DB_PATH);
    if (!is_dir($dbDir)) {
        @mkdir($dbDir, 0775, true);
    }

    // Tabla usuarios
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT UNIQUE,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TEXT NOT NULL
        );
    ");
    // Campos adicionales de perfil y karma
    if (!columnExists($pdo, 'users', 'karma')) {
        $pdo->exec("ALTER TABLE users ADD COLUMN karma INTEGER NOT NULL DEFAULT 0");
    }
    foreach (['profile_picture', 'nationality', 'display_name', 'favorite_team'] as $col) {
        if (!columnExists($pdo, 'users', $col)) {
            $pdo->exec("ALTER TABLE users ADD COLUMN $col TEXT");
        }
    }

    // Tabla partidos
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_match_id INTEGER UNIQUE NOT NULL,
            home_team TEXT NOT NULL,
            away_team TEXT NOT NULL,
            home_score INTEGER,
            away_score INTEGER,
            status TEXT,
            match_date TEXT NOT NULL,
            competition TEXT,
            created_at TEXT NOT NULL
        );
    ");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_matches_api_id ON matches(api_match_id)");

    // Tabla comentarios
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    ");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_comments_match_id ON comments(match_id)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_comments_match_created ON comments(match_id, created_at DESC)");

    // Tabla votos (karma)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            comment_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            vote_type TEXT NOT NULL CHECK(vote_type IN ('up', 'down')),
            created_at TEXT NOT NULL,
            FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(comment_id, user_id)
        );
    ");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_votes_comment_id ON votes (comment_id)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes (user_id)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_votes_comment_user ON votes (comment_id, user_id)");

    // Tabla contenidos
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS contents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            body TEXT,
            file_path TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    ");

    echo json_encode(['status' => 'ok', 'message' => 'Tablas creadas/actualizadas correctamente']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => $e->getMessage()]);
}

