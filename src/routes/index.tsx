import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const nav = useNavigate()

  function handleText(
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) {
    let text = e.target.value

    text = text.toUpperCase()
    text = text.replaceAll(/[^A-Z0-9]/g, '')

    e.target.value = text
  }

  return (
    <main className="flex flex-col justify-center items-center w-screen h-screen">
      <Label className="m-4 text-xl">Welcome</Label>
      <Input
        className="w-sm h-12"
        onChange={(e) => handleText(e)}
        placeholder="Enter Party Code"
      />
      <div className="flex p-8">
        <Button
          variant="outline"
          className="mx-4 p-8"
          onClick={() => nav({ to: '/host' })}
        >
          Start a Game
        </Button>
        <Button variant="secondary" className="mx-4 p-8">
          Join a Game
        </Button>
      </div>
    </main>
  )
}
