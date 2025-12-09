<?php
/**
 * Script para generar comentarios ficticios contextualizados
 * Crea usuarios ficticios y comentarios realistas basados en los partidos
 */
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

try {
    $pdo = getConnection();
    
    // Usuarios ficticios con diferentes perfiles
    $fakeUsers = [
        ['username' => 'FutbolFan2024', 'display_name' => 'Carlos M.', 'nationality' => 'Argentina', 'favorite_team' => 'Boca Juniors'],
        ['username' => 'PremierLover', 'display_name' => 'James W.', 'nationality' => 'England', 'favorite_team' => 'Manchester United'],
        ['username' => 'LaLigaExpert', 'display_name' => 'María G.', 'nationality' => 'Spain', 'favorite_team' => 'Real Madrid'],
        ['username' => 'BundesligaFan', 'display_name' => 'Klaus H.', 'nationality' => 'Germany', 'favorite_team' => 'Bayern Munich'],
        ['username' => 'SerieA_Italia', 'display_name' => 'Marco R.', 'nationality' => 'Italy', 'favorite_team' => 'Juventus'],
        ['username' => 'FutbolAnalitico', 'display_name' => 'Ana L.', 'nationality' => 'Brazil', 'favorite_team' => 'Flamengo'],
        ['username' => 'SoccerPassion', 'display_name' => 'Diego S.', 'nationality' => 'Argentina', 'favorite_team' => 'River Plate'],
        ['username' => 'PremierLeagueUK', 'display_name' => 'David T.', 'nationality' => 'England', 'favorite_team' => 'Liverpool'],
        ['username' => 'ElClasicoFan', 'display_name' => 'Sergio M.', 'nationality' => 'Spain', 'favorite_team' => 'Barcelona'],
        ['username' => 'FutbolTotal', 'display_name' => 'Roberto F.', 'nationality' => 'Mexico', 'favorite_team' => 'Chivas'],
        ['username' => 'FootballGuru', 'display_name' => 'Alex K.', 'nationality' => 'France', 'favorite_team' => 'Paris Saint-Germain'],
        ['username' => 'SoccerWorld', 'display_name' => 'Luis P.', 'nationality' => 'Colombia', 'favorite_team' => 'Atlético Nacional'],
    ];
    
    // Plantillas de comentarios por tipo
    $commentTemplates = [
        'positive_home' => [
            '¡Increíble partido de {home_team}! Demostraron su calidad hoy.',
            '{home_team} jugó a otro nivel. Merecida victoria.',
            'Qué manera de jugar de {home_team}. Se nota la diferencia de nivel.',
            'Impresionante {home_team}. Siguen demostrando por qué son grandes.',
            '{home_team} fue superior en todos los aspectos. Bien merecido.',
        ],
        'positive_away' => [
            'Gran partido de {away_team}. Jugaron muy bien de visitante.',
            '{away_team} demostró carácter. Buena actuación.',
            'Me encantó ver jugar a {away_team} así. Muy buen fútbol.',
            '{away_team} se llevó bien el partido. Merecido resultado.',
            'Excelente nivel de {away_team}. Se nota el trabajo del técnico.',
        ],
        'negative_home' => [
            '{home_team} no estuvo a la altura hoy. Muy flojo.',
            'Qué decepción {home_team}. Esperaba mucho más.',
            '{home_team} jugó muy mal. No se puede perder así.',
            'Muy pobre el rendimiento de {home_team}. Tienen que mejorar.',
            '{home_team} no mostró nada. Partido para olvidar.',
        ],
        'negative_away' => [
            '{away_team} no aprovechó sus oportunidades. Muy mal.',
            'Qué partido más pobre de {away_team}. No dieron la talla.',
            '{away_team} decepcionó. Esperaba mucho más de ellos.',
            'Muy flojo {away_team}. Tienen que replantearse muchas cosas.',
            '{away_team} no estuvo a la altura. Partido para olvidar.',
        ],
        'analytical' => [
            'El partido se definió en el medio campo. {home_team} controló mejor el ritmo.',
            'La clave fue la presión alta de {home_team}. No dejaron respirar a {away_team}.',
            'Se notó la diferencia táctica. {home_team} fue más ordenado.',
            'El partido cambió en el segundo tiempo. {home_team} supo aprovechar mejor.',
            'La velocidad de transición de {home_team} fue determinante.',
            '{away_team} tuvo las oportunidades pero no las concretó. Eso fue la diferencia.',
        ],
        'emotional' => [
            '¡Qué partidazo! {home_team} vs {away_team} siempre da espectáculo.',
            'Increíble cómo terminó. {home_team} se llevó los tres puntos en el último minuto.',
            'No me lo puedo creer. {home_team} remontó de manera épica.',
            '¡Qué emoción! Este partido tenía de todo. {home_team} fue superior.',
            'Partido de infarto. {home_team} y {away_team} dieron todo.',
        ],
        'comparison' => [
            '{home_team} demostró que es mejor equipo que {away_team} hoy.',
            'La diferencia de calidad entre {home_team} y {away_team} se notó.',
            '{home_team} jugó como equipo grande. {away_team} todavía le falta.',
            'Se vio la jerarquía. {home_team} es muy superior a {away_team}.',
        ],
        'result_based' => [
            'Con este resultado, {home_team} se consolida en la tabla.',
            '{away_team} necesitaba estos puntos. Mala derrota.',
            'Este triunfo le da aire a {home_team} en la competencia.',
            '{away_team} se complica con este resultado. Tienen que reaccionar.',
        ],
        'neutral' => [
            'Buen partido en general. {home_team} y {away_team} dieron pelea.',
            'Partido equilibrado. {home_team} supo aprovechar mejor sus chances.',
            'Se notó que ambos equipos venían de partidos duros. Partido parejo.',
            'Buen espectáculo. {home_team} y {away_team} mostraron buen nivel.',
        ],
    ];
    
    // Obtener todos los partidos
    $stmt = $pdo->query('SELECT id, home_team, away_team, home_score, away_score, status, competition FROM matches ORDER BY match_date DESC LIMIT 50');
    $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($matches)) {
        echo json_encode(['status' => 'error', 'message' => 'No hay partidos en la base de datos']);
        exit;
    }
    
    $createdUsers = [];
    $createdComments = 0;
    
    // Crear usuarios ficticios si no existen
    foreach ($fakeUsers as $userData) {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
        $stmt->execute([$userData['username']]);
        $existing = $stmt->fetch();
        
        if (!$existing) {
            $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('
                INSERT INTO users (username, password_hash, display_name, nationality, favorite_team, created_at) 
                VALUES (?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                $userData['username'],
                $passwordHash,
                $userData['display_name'],
                $userData['nationality'],
                $userData['favorite_team'],
                date('Y-m-d H:i:s', strtotime('-' . rand(30, 180) . ' days'))
            ]);
            $userId = $pdo->lastInsertId();
            $createdUsers[] = $userId;
        } else {
            $createdUsers[] = $existing['id'];
        }
    }
    
    // Obtener todos los IDs de usuarios (ficticios y reales)
    $stmt = $pdo->query('SELECT id, favorite_team FROM users');
    $allUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Generar comentarios para cada partido
    foreach ($matches as $match) {
        $homeTeam = $match['home_team'];
        $awayTeam = $match['away_team'];
        $homeScore = $match['home_score'];
        $awayScore = $match['away_score'];
        $status = $match['status'];
        $matchId = $match['id'];
        
        // Determinar cuántos comentarios generar (entre 3 y 8 por partido)
        $numComments = rand(3, 8);
        
        // Seleccionar usuarios aleatorios
        $selectedUsers = array_rand($allUsers, min($numComments, count($allUsers)));
        if (!is_array($selectedUsers)) {
            $selectedUsers = [$selectedUsers];
        }
        
        for ($i = 0; $i < $numComments; $i++) {
            $user = $allUsers[$selectedUsers[$i % count($selectedUsers)]];
            $userFavoriteTeam = $user['favorite_team'] ?? '';
            
            // Determinar tipo de comentario según el contexto
            $commentType = determineCommentType($homeTeam, $awayTeam, $homeScore, $awayScore, $userFavoriteTeam, $status);
            
            // Seleccionar plantilla
            $templates = $commentTemplates[$commentType] ?? $commentTemplates['neutral'];
            $template = $templates[array_rand($templates)];
            
            // Reemplazar placeholders
            $content = str_replace(['{home_team}', '{away_team}'], [$homeTeam, $awayTeam], $template);
            
            // Agregar variaciones según el resultado
            if ($homeScore !== null && $awayScore !== null) {
                $scoreComment = generateScoreComment($homeTeam, $awayTeam, $homeScore, $awayScore, $userFavoriteTeam);
                if ($scoreComment && rand(0, 1)) {
                    $content = $scoreComment . ' ' . $content;
                }
            }
            
            // Agregar emojis ocasionalmente
            if (rand(0, 3) === 0) {
                $emojis = ['⚽', '🔥', '💪', '👏', '🎯', '⚡'];
                $content .= ' ' . $emojis[array_rand($emojis)];
            }
            
            // Fecha aleatoria dentro de las últimas 2 semanas
            $daysAgo = rand(0, 14);
            $hoursAgo = rand(0, 23);
            $minutesAgo = rand(0, 59);
            $createdAt = date('Y-m-d H:i:s', strtotime("-$daysAgo days -$hoursAgo hours -$minutesAgo minutes"));
            
            // Insertar comentario
            $stmt = $pdo->prepare('INSERT INTO comments (match_id, user_id, content, created_at) VALUES (?, ?, ?, ?)');
            $stmt->execute([$matchId, $user['id'], $content, $createdAt]);
            $createdComments++;
        }
    }
    
    echo json_encode([
        'status' => 'ok',
        'message' => "Comentarios generados exitosamente",
        'users_created' => count($createdUsers),
        'comments_created' => $createdComments,
        'matches_processed' => count($matches)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

/**
 * Determina el tipo de comentario según el contexto
 */
function determineCommentType($homeTeam, $awayTeam, $homeScore, $awayScore, $userFavoriteTeam, $status) {
    // Si el partido no ha terminado
    if ($status !== 'FINISHED' && $homeScore === null) {
        $types = ['neutral', 'emotional', 'analytical'];
        return $types[array_rand($types)];
    }
    
    // Si el usuario es fan del equipo local
    if (stripos($homeTeam, $userFavoriteTeam) !== false || 
        stripos($userFavoriteTeam, $homeTeam) !== false) {
        if ($homeScore !== null && $awayScore !== null) {
            if ($homeScore > $awayScore) {
                return rand(0, 1) ? 'positive_home' : 'emotional';
            } else {
                return 'negative_home';
            }
        }
        return 'positive_home';
    }
    
    // Si el usuario es fan del equipo visitante
    if (stripos($awayTeam, $userFavoriteTeam) !== false || 
        stripos($userFavoriteTeam, $awayTeam) !== false) {
        if ($homeScore !== null && $awayScore !== null) {
            if ($awayScore > $homeScore) {
                return rand(0, 1) ? 'positive_away' : 'emotional';
            } else {
                return 'negative_away';
            }
        }
        return 'positive_away';
    }
    
    // Comentario neutral o analítico
    if ($homeScore !== null && $awayScore !== null) {
        $types = ['analytical', 'comparison', 'result_based', 'neutral'];
        return $types[array_rand($types)];
    }
    
    return 'neutral';
}

/**
 * Genera un comentario específico sobre el resultado
 */
function generateScoreComment($homeTeam, $awayTeam, $homeScore, $awayScore, $userFavoriteTeam) {
    $scoreDiff = abs($homeScore - $awayScore);
    
    // Victoria del local
    if ($homeScore > $awayScore) {
        if ($scoreDiff >= 3) {
            return "Goleada histórica de $homeTeam. $homeScore-$awayScore es un resultado demoledor.";
        } elseif ($scoreDiff == 2) {
            return "Victoria contundente de $homeTeam por $homeScore-$awayScore.";
        } else {
            return "Triunfo ajustado de $homeTeam $homeScore-$awayScore.";
        }
    }
    
    // Victoria del visitante
    if ($awayScore > $homeScore) {
        if ($scoreDiff >= 3) {
            return "Goleada de $awayTeam. $homeScore-$awayScore, partido para olvidar para $homeTeam.";
        } elseif ($scoreDiff == 2) {
            return "$awayTeam se impuso $homeScore-$awayScore. Buena victoria visitante.";
        } else {
            return "Victoria ajustada de $awayTeam $homeScore-$awayScore.";
        }
    }
    
    // Empate
    if ($homeScore == $awayScore) {
        if ($homeScore >= 2) {
            return "Empate a $homeScore. Partido con muchos goles y emociones.";
        } else {
            return "Empate $homeScore-$awayScore. Partido cerrado y defensivo.";
        }
    }
    
    return null;
}

