import "dotenv/config";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function main() {
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "demo@gymmate.local",
      password: "demo123",
    }),
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
  }

  const cookie = loginRes.headers.get("set-cookie") ?? "";
  const sessionCookie = cookie.split(";")[0];
  console.log("Logged in, cookie:", sessionCookie.slice(0, 40) + "...");

  const storeRes = await fetch(`${BASE}/api/store`, {
    headers: { cookie: sessionCookie },
  });
  const store = (await storeRes.json()) as {
    exercises: { id: string; name: string }[];
    workouts: { id: string }[];
  };
  console.log("Store workouts count:", store.workouts.length);

  const exercise = store.exercises[0];
  if (!exercise) throw new Error("No exercises in store");

  const clientWorkout = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    label: "MEDIUM" as const,
    notes: "test flow",
    sets: [
      {
        id: crypto.randomUUID(),
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        setNumber: 1,
        weight: 50,
        reps: 10,
      },
    ],
  };

  const createRes = await fetch(`${BASE}/api/workouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: sessionCookie,
    },
    body: JSON.stringify({ workout: clientWorkout, exercises: store.exercises }),
  });

  console.log("Create status:", createRes.status);
  const created = (await createRes.json()) as { workout?: { id: string } };
  console.log("Created workout id:", created.workout?.id);

  if (!created.workout?.id) {
    throw new Error("Create response missing workout");
  }

  const getRes = await fetch(`${BASE}/api/workouts/${created.workout.id}`, {
    headers: { cookie: sessionCookie },
  });
  console.log("GET by id status:", getRes.status);
  console.log("GET body:", await getRes.text());

  const storeRes2 = await fetch(`${BASE}/api/store`, {
    headers: { cookie: sessionCookie },
  });
  const store2 = (await storeRes2.json()) as { workouts: { id: string }[] };
  const inStore = store2.workouts.some((w) => w.id === created.workout!.id);
  console.log("In store after create:", inStore);

  await fetch(`${BASE}/api/workouts/${created.workout.id}`, {
    method: "DELETE",
    headers: { cookie: sessionCookie },
  });
  console.log("Cleaned up test workout");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
