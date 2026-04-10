// 미노, 모든 것을 피한다 — 리더보드 API (Cloudflare Worker + KV)

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

const MAX_ENTRIES = 50;

export default {
    async fetch(request, env) {
        // CORS preflight 처리
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // POST /api/score — 스테이지별 스코어 제출
            if (request.method === 'POST' && path === '/api/score') {
                const { name, stage, score, look } = await request.json();
                if (!name || stage === undefined || score === undefined) {
                    return json({ error: '필수 필드 누락 (name, stage, score)' }, 400);
                }
                const key = `stage_${stage}`;
                const lb = JSON.parse(await env.MINO_DODGE_LB.get(key) || '[]');
                lb.push({
                    name: name.slice(0, 10),
                    score: Number(score),
                    look: look || null,
                    date: Date.now(),
                });
                lb.sort((a, b) => b.score - a.score);
                await env.MINO_DODGE_LB.put(key, JSON.stringify(lb.slice(0, MAX_ENTRIES)));
                return json({ ok: true });
            }

            // GET /api/leaderboard/total — 전체 총점 리더보드
            if (request.method === 'GET' && path === '/api/leaderboard/total') {
                const lb = JSON.parse(await env.MINO_DODGE_LB.get('total') || '[]');
                return json(lb);
            }

            // GET /api/leaderboard/:stage — 스테이지별 리더보드 조회
            const stageMatch = path.match(/^\/api\/leaderboard\/(\d+)$/);
            if (request.method === 'GET' && stageMatch) {
                const key = `stage_${stageMatch[1]}`;
                const lb = JSON.parse(await env.MINO_DODGE_LB.get(key) || '[]');
                return json(lb);
            }

            // POST /api/halloffame — 명예의전당 등록 (10스테이지 올클)
            if (request.method === 'POST' && path === '/api/halloffame') {
                const { name, totalScore, totalTime, look, date } = await request.json();
                if (!name || totalScore === undefined) {
                    return json({ error: '필수 필드 누락 (name, totalScore)' }, 400);
                }
                const lb = JSON.parse(await env.MINO_DODGE_LB.get('halloffame') || '[]');
                lb.push({
                    name: name.slice(0, 10),
                    totalScore: Number(totalScore),
                    totalTime: totalTime != null ? Number(totalTime) : null,
                    look: look || null,
                    date: date || new Date().toISOString(),
                });
                // 총점 높은 순 정렬
                lb.sort((a, b) => b.totalScore - a.totalScore);
                await env.MINO_DODGE_LB.put('halloffame', JSON.stringify(lb.slice(0, MAX_ENTRIES)));
                return json({ ok: true });
            }

            // GET /api/halloffame — 명예의전당 목록
            if (request.method === 'GET' && path === '/api/halloffame') {
                const lb = JSON.parse(await env.MINO_DODGE_LB.get('halloffame') || '[]');
                return json(lb);
            }

            // GET /api/total — 전체 등록된 플레이어 수
            if (request.method === 'GET' && path === '/api/total') {
                // 모든 스테이지 + 명예의전당에서 고유 이름 수집
                const names = new Set();
                const keys = await env.MINO_DODGE_LB.list();
                for (const key of keys.keys) {
                    const data = JSON.parse(await env.MINO_DODGE_LB.get(key.name) || '[]');
                    if (Array.isArray(data)) {
                        data.forEach(entry => {
                            if (entry.name) names.add(entry.name);
                        });
                    }
                }
                return json({ totalPlayers: names.size });
            }

            return json({ error: 'Not found' }, 404);
        } catch (e) {
            return json({ error: e.message || '서버 오류' }, 500);
        }
    }
};

// JSON 응답 헬퍼
function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
}
