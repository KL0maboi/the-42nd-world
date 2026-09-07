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
  .validator(formSchema)
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
        className="bg-foreground/5 p-8 rounded-md w-lg h-auto"
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
                      <div
                        className={`grid transition-[grid-template-rows] duration-150 ease-out ${
                          errors.length > 0
                            ? 'grid-rows-[1fr]'
                            : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <FieldError
                            errors={errors}
                            className={`grid transition-[grid-template-rows] duration-150 ease-out ${
                              errors.length > 0
                                ? 'grid-rows-[1fr]'
                                : 'grid-rows-[0fr]'
                            }`}
                          />
                        </div>
                      </div>
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
                      <FieldError errors={errors} />
                    </>
                  )
                }}
              </form.Field>
              <FieldError />
            </Field>
            <Button type="submit" children="Host Lobby" />
          </FieldGroup>
        </FieldGroup>
      </form>
    </main>
  )
}
