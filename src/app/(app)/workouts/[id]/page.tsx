import { WorkoutDetailView } from "@/components/workout-detail-view";

type WorkoutDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkoutDetailPage({ params }: WorkoutDetailPageProps) {
  const { id } = await params;
  return <WorkoutDetailView id={id} />;
}
