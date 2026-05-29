import { WorkoutEditView } from "@/components/workout-edit-view";

type WorkoutEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkoutEditPage({ params }: WorkoutEditPageProps) {
  const { id } = await params;
  return <WorkoutEditView id={id} />;
}
