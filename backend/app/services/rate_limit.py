from __future__ import annotations

from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone


_WINDOW = timedelta(minutes=1)
_MAX = 10

# ip -> deque[timestamps]
_hits: dict[str, deque[datetime]] = defaultdict(deque)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def allow_activation(ip: str | None) -> bool:
    key = ip or "unknown"
    now = _utc_now()
    q = _hits[key]

    # drop old
    cutoff = now - _WINDOW
    while q and q[0] < cutoff:
        q.popleft()

    if len(q) >= _MAX:
        return False

    q.append(now)
    return True


def _reset_for_tests() -> None:
    _hits.clear()

