/* Payload contract test.

   The course screens are only as good as the normalisers in
   `src/api/catalogue.js` and `src/api/learning.js`. This script bundles those
   modules for Node, feeds them representative Laravel payloads and asserts the
   fields every screen renders.

   Usage: npm run test:data
*/

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";
import * as esbuild from "esbuild";

let failures = 0;

const check = (name, condition, detail = "") => {
  if (condition) {
    console.log(`✓ ${name}`);
    return;
  }
  failures += 1;
  console.log(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
};

const equals = (name, actual, expected) =>
  check(
    name,
    JSON.stringify(actual) === JSON.stringify(expected),
    `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
  );

/* ------------------------------------------------------------ */

async function loadModules() {
  // The bundle must live inside the project so Node can resolve `axios`.
  const outdir = path.join(process.cwd(), "node_modules", ".cache", "data-check");
  fs.mkdirSync(outdir, { recursive: true });

  const files = {
    catalogue: path.join(outdir, "catalogue.mjs"),
    learning: path.join(outdir, "learning.mjs"),
  };

  for (const [name, entry] of [
    ["catalogue", "src/api/catalogue.js"],
    ["learning", "src/api/learning.js"],
  ]) {
    await esbuild.build({
      entryPoints: [entry],
      outfile: files[name],
      bundle: true,
      format: "esm",
      platform: "node",
      packages: "external",
      define: { "import.meta.env": "{}" },
      logLevel: "error",
    });
  }

  return {
    catalogue: await import(pathToFileURL(files.catalogue).href),
    learning: await import(pathToFileURL(files.learning).href),
  };
}

const run = async () => {
  const { catalogue, learning } = await loadModules();
  const {
    cohortAvailability,
    normaliseCourse,
    normaliseCohort,
    normaliseCurriculum,
    primaryCohort,
  } = catalogue;

  /* ------------------------------------------------ course payload */
  const raw = {
    id: 7,
    provider_id: 3,
    title: "Project Management Essentials",
    category: "Management",
    mode: "Online",
    short_description: "Plan and deliver projects.",
    long_description: "Full description.",
    learning_outcomes: ["Scope a project", "Build a schedule"],
    skills: ["Planning"],
    requirements: ["Two years experience"],
    contents: [
      {
        title: "Introduction",
        description: "Welcome",
        notes_text: "Read chapter 1",
        video: "uploads/courses/videos/a.mp4",
        video_links: ["https://youtu.be/x"],
        handouts: ["uploads/courses/docs/a.pdf"],
      },
      { title: "Scoping", description: "", notes_text: "", video: null, video_links: [], handouts: [] },
    ],
    status: "Draft",
    banner: "uploads/banners/b.jpg",
    provider: { id: 3, name: "Acme Training" },
    cohorts: [
      {
        id: 11,
        intake_name: "Jan 2027",
        capacity: "30",
        seats_taken: "12",
        price: "250000",
        registration_deadline: "2027-01-05",
        start_date: "2027-01-10",
        end_date: "2027-02-10",
        status: "OPEN",
      },
      {
        id: 12,
        intake_name: "Feb 2027",
        capacity: 20,
        seats_taken: 20,
        price: 300000,
        registration_deadline: "2026-12-01",
        start_date: "2026-12-10",
        status: "FULL",
      },
    ],
  };

  const course = normaliseCourse(raw);

  equals("title from payload", course.title, "Project Management Essentials");
  equals(
    "learning outcomes are a string array",
    course.learning_outcomes,
    ["Scope a project", "Build a schedule"]
  );
  equals("provider name resolved", course.provider.name, "Acme Training");
  equals("cheapest cohort price used", course.price, 250000);
  equals("draft courses stay visible", catalogue.isPubliclyVisible(raw), true);
  equals(
    "closed courses are hidden",
    catalogue.isPubliclyVisible({ ...raw, status: "Closed" }),
    false
  );

  equals(
    "cohort numbers and derived seats",
    course.cohorts.map((cohort) => [
      cohort.id,
      cohort.capacity,
      cohort.seats_taken,
      cohort.remaining_seats,
      cohort.status,
    ]),
    [
      [11, 30, 12, 18, "OPEN"],
      [12, 20, 20, 0, "FULL"],
    ]
  );

  equals("primary cohort is the open one", primaryCohort(course.cohorts).id, 11);
  equals("open cohort is enrolable", cohortAvailability(course.cohorts[0]).open, true);
  equals("full cohort is blocked", cohortAvailability(course.cohorts[1]).state, "full");
  equals(
    "expired deadline blocks enrolment",
    cohortAvailability({
      id: 3,
      capacity: 10,
      seats_taken: 1,
      registration_deadline: "2020-01-01",
      status: "OPEN",
    }).state,
    "closed"
  );

  equals(
    "curriculum sessions flattened",
    course.curriculum.map((session) => [
      session.title,
      session.video,
      session.video_links.length,
      session.handouts.length,
    ]),
    [
      ["Introduction", "uploads/courses/videos/a.mp4", 1, 1],
      ["Scoping", null, 0, 0],
    ]
  );

  // Legacy nested shape must still flatten.
  equals(
    "legacy section/lesson shape flattens",
    normaliseCurriculum([
      { title: "Module A", lessons: [{ title: "Lesson 1" }, { title: "Lesson 2" }] },
    ]).map((session) => session.title),
    ["Module A — Lesson 1", "Module A — Lesson 2"]
  );

  equals(
    "JSON string lists are parsed",
    normaliseCourse({ ...raw, skills: '["Excel","Power BI"]' }).skills,
    ["Excel", "Power BI"]
  );

  equals("null cohort stays null", normaliseCohort(null), null);
  equals("garbage payload is ignored", normaliseCourse("nope"), null);

  /* ------------------------------------------------ learning payload */
  const classroom = learning.normaliseLearningPayload({
    id: 7,
    title: "Project Management Essentials",
    progress_percentage: 50,
    modules: [
      {
        id: 1,
        title: "Introduction",
        notes: "Read chapter 1",
        video_url: "https://api.test/uploads/a.mp4",
        links: ["https://youtu.be/x"],
        handouts: ["https://api.test/uploads/a.pdf"],
        completed: true,
      },
      { id: 2, title: "Scoping", completed: false },
    ],
  });

  equals("classroom title", classroom.title, "Project Management Essentials");
  equals("module ids are strings", classroom.modules[0].id, "1");
  equals("completed mapped to is_completed", classroom.modules[0].is_completed, true);
  equals("links mirrored as video_links", classroom.modules[0].video_links, ["https://youtu.be/x"]);
  equals("progress passed through", classroom.progress_percentage, 50);

  const enrolment = learning.normaliseEnrolment({
    id: 55,
    reference: "TRH-ABC",
    status: "COMPLETED",
    course: raw,
    cohort: { id: 11, intake_name: "Jan 2027", capacity: 30, seats_taken: 12, status: "OPEN" },
  });

  equals("enrolment course id", enrolment.courseId, 7);
  equals("enrolment cohort name", enrolment.cohortName, "Jan 2027");
  equals("enrolment lesson count", enrolment.totalLessons, 2);

  /* ------------------------------------------------ envelopes */
  equals(
    "bare arrays pass through extractList",
    catalogue.extractList([{ id: 1 }]).length,
    1
  );
  equals(
    "data envelopes are unwrapped",
    catalogue.extractList({ data: [{ id: 1 }] }).length,
    1
  );
  equals(
    "nested envelopes are unwrapped",
    catalogue.extractList({ data: { data: [{ id: 1 }] } }).length,
    1
  );

  /* ------------------------------------------------ diagnostics contract */
  // The empty-catalogue panel depends on these strings being readable and on
  // failures being classified correctly. Keep them pinned.
  equals(
    "failed attempts describe status",
    catalogue.describeAttempts([
      { endpoint: "/public-courses", ok: false, status: 401, reason: "error", detail: "HTTP 401" },
      { endpoint: "/training", ok: false, status: null, reason: "error", detail: "network error (no response)" },
    ]),
    "/public-courses → HTTP 401 · /training → network error (no response)"
  );
  equals(
    "empty vs filtered vs ok attempts",
    catalogue.describeAttempts([
      { endpoint: "/public-courses", ok: false, status: 200, reason: "empty" },
      { endpoint: "/training", ok: false, status: 200, rawCount: 3, reason: "filtered" },
    ]),
    "/public-courses → empty list · /training → 3 records, none public"
  );
  equals(
    "healthy attempts report counts",
    catalogue.describeAttempts([{ endpoint: "/public-courses", ok: true, count: 4 }]),
    "/public-courses → 4 courses"
  );
  check(
    "401 attempts are detectable",
    catalogue.attemptsHave401([{ status: 401 }]) && !catalogue.attemptsHave401([{ status: 500 }])
  );

  const tmp = path.join(process.cwd(), "node_modules", ".cache", "data-check");
  if (!process.env.KEEP_TMP) fs.rmSync(tmp, { recursive: true, force: true });

  console.log(
    failures === 0
      ? "\nAll payload contract checks passed"
      : `\n${failures} payload contract check(s) failed`
  );
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((error) => {
  console.error(error);
  console.error(os.EOL, "Contract test crashed");
  process.exit(1);
});
