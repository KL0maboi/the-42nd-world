import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/room/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/room/$id/"!</div>;
}
