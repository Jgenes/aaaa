import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axio";

/**
 * Site-wide announcement strip.
 *
 * The items are derived from live catalogue data (`/public-courses`) — newly
 * published trainings, cohorts that are about to start and enrolment
 * deadlines that are closing. Nothing is hardcoded: when the API returns no
 * usable data the strip simply does not render.
 */

const DISMISS_KEY = "th.notice.dismissed";
const CACHE_KEY = "th.notice.cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_ITEMS = 3;
const DEADLINE_WINDOW_DAYS = 14;

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const shortDate = (date) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(date);

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

function buildNotifications(courses) {
  const today = startOfToday();
  const items = [];

  // 1. Cohorts that are open and starting soon.
  const startingSoon = [];
  // 2. Enrolment deadlines inside the reminder window.
  const closingSoon = [];

  courses.forEach((course) => {
    if (!course?.id) return;
    (course.cohorts || []).forEach((cohort) => {
      const start = parseDate(cohort?.start_date);
      if (start && start >= today && cohort?.status?.toUpperCase() === "OPEN") {
        startingSoon.push({ course, cohort, start });
      }

      const deadline = parseDate(cohort?.registration_deadline);
      if (deadline && deadline >= today) {
        const days = Math.round((deadline - today) / 86400000);
        if (days <= DEADLINE_WINDOW_DAYS) {
          closingSoon.push({ course, deadline, days });
        }
      }
    });
  });

  startingSoon
    .sort((a, b) => a.start - b.start)
    .slice(0, 1)
    .forEach(({ course, cohort, start }) => {
      items.push({
        id: `cohort-${course.id}-${cohort.id ?? start.getTime()}`,
        tag: "New cohort",
        text: `${cohort.intake_name || course.title} starts ${shortDate(start)}`,
        to: `/course/${course.id}`,
      });
    });

  closingSoon
    .sort((a, b) => a.deadline - b.deadline)
    .slice(0, 1)
    .forEach(({ course, deadline, days }) => {
      items.push({
        id: `deadline-${course.id}-${deadline.getTime()}`,
        tag: "Closing soon",
        text:
          days <= 0
            ? `${course.title} enrolment closes today`
            : `${course.title} enrolment closes in ${days} day${days === 1 ? "" : "s"}`,
        to: `/course/${course.id}`,
      });
    });

  // 3. Most recently published trainings.
  [...courses]
    .filter((course) => course?.id)
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 1)
    .forEach((course) => {
      items.push({
        id: `course-${course.id}`,
        tag: "New training",
        text: course.title,
        to: `/course/${course.id}`,
      });
    });

  // One line per course — a course that is both "new" and "closing soon"
  // should not fill the strip twice.
  const seen = new Set();
  return items
    .filter((item) => {
      if (seen.has(item.to)) return false;
      seen.add(item.to);
      return true;
    })
    .slice(0, MAX_ITEMS);
}

const readCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.at || Date.now() - parsed.at > CACHE_TTL) return null;
    return Array.isArray(parsed.items) ? parsed.items : null;
  } catch {
    return null;
  }
};

const writeCache = (items) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items }));
  } catch {
    /* storage unavailable — the strip simply refetches next page */
  }
};

export default function NotificationBar() {
  const [items, setItems] = useState(() => readCache() || []);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (readCache()) return;

    let active = true;
    const load = async () => {
      try {
        const res = await api.get("/public-courses");
        const raw = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        const next = buildNotifications(Array.isArray(raw) ? raw : []);
        writeCache(next);
        if (active) setItems(next);
      } catch {
        // No announcements when the catalogue is unreachable.
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => items.filter((item) => item?.text), [items]);

  if (dismissed || visible.length === 0) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="site-notice" role="region" aria-label="Latest announcements">
      <div className="th-container-wide site-notice__inner">
        <span className="site-notice__label">
          <i className="bi bi-broadcast-pin" aria-hidden="true"></i>
          Latest
        </span>

        <ul className="site-notice__list">
          {visible.map((item) => (
            <li key={item.id} className="site-notice__item">
              <span className="site-notice__tag">{item.tag}</span>
              <Link to={item.to} className="site-notice__link">
                {item.text}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="site-notice__close"
          onClick={dismiss}
          aria-label="Dismiss announcements"
        >
          <i className="bi bi-x-lg" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}
