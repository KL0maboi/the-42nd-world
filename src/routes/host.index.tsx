import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import z from 'zod'
import { Button } from '#/components/ui/button'
import { Slider } from '#/components/ui/slider'
import { useState } from 'react'
import { createServerFn } from '@tanstack/react-start'

export const Route = createFileRoute('/host/')({
  component: RouteComponent,
})

export const formSchema = z.object({
  name: z.string().min(4).max(16),
  playerCount: z.number().min(4).max(12),
})

const submitFormFn = createServerFn({ method: 'POST', strict: true })
  .validator(console.log)
  .handler(async ({ data }) => {
    console.log('handling form server after validation', data)
  })

function RouteComponent() {
  const form = useForm({
    defaultValues: {
      name: '',
      playerCount: 8,
    },
    validators: { onChange: formSchema },
    onSubmit: async ({ value }) => {
      submitFormFn({ data: value })
    },
  })

  const [sliderValue, setSliderValue] = useState(8)

  return (
    <main className="flex flex-col justify-center items-center w-screen h-screen">
      <form
        action="submit"
        className="bg-foreground/5 p-8 rounded-md w-lg h-3/5"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <FieldLegend>Create Room</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel>Room Name</FieldLabel>
              <form.Field name="name">
                {(field) => {
                  const { errors } = field.state.meta
                  return (
                    <>
                      <Input
                        name="name"
                        autoComplete="off"
                        min={3}
                        placeholder="Room 101"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {errors && <FieldError errors={errors} />}
                    </>
                  )
                }}
              </form.Field>
            </Field>
            <Field>
              <FieldLabel>Player Count - {sliderValue}</FieldLabel>
              <form.Field name="playerCount">
                {(field) => {
                  const { errors } = field.state.meta
                  return (
                    <>
                      <Slider
                        defaultValue={[8]}
                        max={12}
                        min={4}
                        step={1}
                        onValueChange={(n) => setSliderValue(n[0])}
                        className="cursor-pointer"
                      />
                      {errors && <FieldError errors={errors} />}
                    </>
                  )
                }}
              </form.Field>
              <FieldError />
            </Field>
            <Button type="submit" children="Click" />
          </FieldGroup>
          {/* <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />
              <FieldDescription>
                This appears on invoices and emails.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input id="username" autoComplete="off" aria-invalid />
              <FieldError>Choose another username.</FieldError>
            </Field>
          </FieldGroup>
        </FieldSet> */}
        </FieldGroup>
      </form>
    </main>
  )
}
