"use client"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useState } from "react"
import { useApp } from "@/components/app/use-app"
import { Switch, Toggle } from "@/components/graphical"
import {
  Check,
  Copy,
  Eye,
  KeyRound,
  Laptop,
  Smartphone,
} from "@/components/icons"
import { CategoryBadge } from "@/components/kit/category"
import { Confirm } from "@/components/kit/overlays"
import {
  Banner,
  CheckRow,
  FormField,
  RadioList,
  Segmented,
  SelectBox,
  SwitchRow,
} from "@/components/kit/ui"
import { Saved } from "@/components/settings/settings-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  addPasskey,
  changeHomeClub,
  removePasskey,
  resetCalendarToken,
  setNotifCell,
  setPrefs,
  signOut,
  updateMember,
} from "@/lib/actions"
import { CATEGORIES, CLUBS } from "@/lib/data/catalog"
import { fmtMoney } from "@/lib/time"
import { toast } from "@/lib/toast"
import type { CategoryId } from "@/lib/types"

function useSaved() {
  const [k, setK] = useState("")
  return {
    k,
    mark: (x: string) => {
      setK(x)
      setTimeout(() => setK(""), 3000)
    },
  }
}

export function ProfileSettings() {
  const { me, prefs } = useApp()
  const { k, mark } = useSaved()
  const [first, setFirst] = useState(me.firstName)
  const [last, setLast] = useState(me.lastName)
  const [pref, setPref] = useState(prefs.preferredName)
  const [phone, setPhone] = useState(prefs.phone)
  const [email, setEmail] = useState(me.email)
  const [em, setEm] = useState(prefs.emergency)
  const [err, setErr] = useState("")
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <span className="grid size-16 place-items-center rounded-full bg-muted font-heading text-h3">
          {me.firstName[0]}
          {me.lastName[0]}
        </span>
        <div>
          <Button variant="outline" size="sm" disabled>
            Upload a photo · Coming soon
          </Button>
          <p className="mt-1 text-detail text-muted-foreground">
            Needed for your pass. Use a photo of your face, at least 400 px
            wide.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name">
          {(p) => (
            <Input
              {...p}
              autoComplete="given-name"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              onBlur={() => {
                updateMember(me.id, { firstName: first })
                mark("fn")
              }}
            />
          )}
        </FormField>
        <FormField label="Last name">
          {(p) => (
            <Input
              {...p}
              autoComplete="family-name"
              value={last}
              onChange={(e) => setLast(e.target.value)}
              onBlur={() => {
                updateMember(me.id, { lastName: last })
                mark("ln")
              }}
            />
          )}
        </FormField>
      </div>
      <FormField label="Preferred name">
        {(p) => (
          <Input
            {...p}
            value={pref}
            onChange={(e) => setPref(e.target.value)}
            onBlur={() => {
              setPrefs(me.id, { preferredName: pref })
              mark("pn")
            }}
          />
        )}
      </FormField>
      <FormField label="Date of birth" help="Read-only after it is set.">
        {(p) => <Input {...p} readOnly value={me.dob} />}
      </FormField>
      <FormField label="Mobile number" error={err}>
        {(p) => (
          <Input
            {...p}
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => {
              if (phone.replace(/\D/g, "").length < 10)
                return setErr("Check the mobile number. Use 10 digits.")
              setErr("")
              setPrefs(me.id, { phone })
              mark("ph")
            }}
          />
        )}
      </FormField>
      <FormField label="Email" help="We email a link to verify a change.">
        {(p) => (
          <Input
            {...p}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => {
              updateMember(me.id, { email })
              mark("em")
            }}
          />
        )}
      </FormField>
      <FormField label="Emergency contact">
        {(p) => (
          <Input
            {...p}
            value={em}
            onChange={(e) => setEm(e.target.value)}
            placeholder="Name, phone"
            onBlur={() => {
              setPrefs(me.id, { emergency: em })
              mark("ec")
            }}
          />
        )}
      </FormField>
      <Saved show={!!k} />
    </div>
  )
}

export function PreferencesSettings() {
  const { s, me, hh, prefs } = useApp()
  const { k, mark } = useSaved()
  const [err, setErr] = useState("")
  const toggle = (id: CategoryId) => {
    setPrefs(me.id, {
      interests: prefs.interests.includes(id)
        ? prefs.interests.filter((x) => x !== id)
        : [...prefs.interests, id],
    })
    mark("i")
  }
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <SelectBox
          label="Home club"
          value={me.homeClub}
          onChange={(v) => {
            const r = changeHomeClub(me.id, v)
            if (!r.ok) setErr(r.message)
            else {
              setErr("")
              mark("hc")
              toast({ title: "Home club updated" })
            }
          }}
          options={CLUBS.map((c) => ({ value: c.slug, label: c.name }))}
          className="max-w-xs"
        />
        <p className="text-detail text-muted-foreground">
          We show this club first.{" "}
          {hh.plan === "trailhead"
            ? "Trailhead members can change home club once per billing cycle."
            : "Ridge and Summit members can change it any time."}
        </p>
        {err ? (
          <p
            role="alert"
            className="text-caption font-semibold text-destructive"
          >
            {err}
          </p>
        ) : null}
      </div>
      <fieldset className="flex flex-col gap-3">
        <legend className="text-label">Interests</legend>
        <ul className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Toggle
                pressed={prefs.interests.includes(c.id as CategoryId)}
                onPressedChange={() => toggle(c.id as CategoryId)}
                className="max-md:min-h-11"
              >
                <CategoryBadge id={c.id as CategoryId} size="md" />
              </Toggle>
            </li>
          ))}
        </ul>
        <SwitchRow
          checked={prefs.firstTimersFirst}
          onChange={(c) => {
            setPrefs(me.id, { firstTimersFirst: c })
            mark("ft")
          }}
        >
          Show first-timer classes first
        </SwitchRow>
      </fieldset>
      <RadioList
        label="Goal"
        value={prefs.goal}
        onChange={(v) => {
          setPrefs(me.id, { goal: v })
          mark("g")
        }}
        options={[
          { value: "build-strength", label: "Build strength" },
          { value: "move-more", label: "Move more" },
          { value: "event", label: "Train for an event" },
          { value: "stay-consistent", label: "Stay consistent" },
          { value: "recover", label: "Recover well" },
        ]}
      />
      <div className="flex flex-col gap-2">
        <p className="text-label">Visits per week</p>
        <Segmented
          label="Visits per week"
          value={prefs.weeklyTarget}
          onChange={(v) => {
            setPrefs(me.id, { weeklyTarget: v })
            mark("w")
          }}
          options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({
            value: n,
            label: String(n),
          }))}
        />
        <p className="text-detail text-muted-foreground">
          Rest days count too.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={!prefs.savedFilters}
          onClick={() => {
            setPrefs(me.id, { savedFilters: undefined })
            toast({ title: "Saved filters cleared" })
          }}
        >
          Clear saved schedule filters
        </Button>
      </div>
      <Saved show={!!k} />
      <span className="sr-only">{s.seq}</span>
    </div>
  )
}

const TOPICS = [
  ["reminders", "Class reminders"],
  ["waitlist", "Waitlist and held spots"],
  ["changes", "Booking changes"],
  ["coach", "Coach messages"],
  ["news", "Club news"],
  ["billing", "Billing"],
  ["marketing", "Marketing"],
] as const
export function NotificationSettings() {
  const { me, prefs } = useApp()
  const { k, mark } = useSaved()
  const [push, setPush] = useState<"default" | "granted" | "denied">(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  )
  const ask = async (topic: string, on: boolean) => {
    if (
      on &&
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      const r = await Notification.requestPermission()
      setPush(r)
    }
    setNotifCell(me.id, topic, "push", on)
    mark("n")
  }
  return (
    <div className="flex flex-col gap-6">
      <table className="w-full text-left">
        <caption className="sr-only">Notification topics and channels</caption>
        <thead>
          <tr className="text-caption text-muted-foreground">
            <th scope="col" className="py-2 font-normal">
              Topic
            </th>
            {["Push", "Email", "Text"].map((c) => (
              <th key={c} scope="col" className="w-20 text-center font-normal">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TOPICS.map(([t, label]) => (
            <tr key={t} className="rule-b">
              <th scope="row" className="py-3 pr-2 text-body font-normal">
                {label}
                {t === "reminders" ? (
                  <span className="mt-1 flex items-center gap-2 text-detail text-muted-foreground">
                    <SelectBox
                      label="Time before"
                      hideLabel
                      value={String(prefs.reminderMin)}
                      onChange={(v) => {
                        setPrefs(me.id, { reminderMin: Number(v) as 60 })
                        mark("r")
                      }}
                      options={[
                        { value: "30", label: "30 min before" },
                        { value: "60", label: "60 min before" },
                        { value: "120", label: "120 min before" },
                      ]}
                      className="w-40"
                    />
                  </span>
                ) : null}
                {t === "billing" ? (
                  <span className="block text-detail text-muted-foreground">
                    Email is always on.
                  </span>
                ) : null}
              </th>
              {(["push", "email", "text"] as const).map((c) => (
                <td key={c} className="text-center">
                  <Switch.Root
                    aria-label={`${label}, ${c}`}
                    checked={
                      t === "billing" && c === "email"
                        ? true
                        : prefs.notif[t][c]
                    }
                    disabled={t === "billing" && c === "email"}
                    onCheckedChange={(on) => {
                      if (c === "push") {
                        void ask(t, !!on)
                        return
                      }
                      setNotifCell(me.id, t, c, !!on)
                      mark("n")
                    }}
                  >
                    <Switch.Thumb />
                  </Switch.Root>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-col gap-2">
        <SwitchRow
          checked={prefs.quietHours}
          onChange={(c) => {
            setPrefs(me.id, { quietHours: c })
            mark("q")
          }}
        >
          Quiet hours 9:00 p.m. – 5:00 a.m.
        </SwitchRow>
        <p className="text-detail text-muted-foreground">
          Held-spot alerts still come through.
        </p>
      </div>
      <p className="text-caption text-muted-foreground">
        Browser push:{" "}
        {push === "granted"
          ? "On in this browser."
          : push === "denied"
            ? "Push is blocked in this browser. Use email or text."
            : "Not asked yet. Turn on Push above and we'll ask."}
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "Test notification",
              description: "This is what an alert looks like.",
              type: "info",
            })
          }
        >
          Send test notification
        </Button>
        <Saved show={!!k} />
      </div>
    </div>
  )
}

export function CalendarSettings() {
  const { me, prefs } = useApp()
  const [reveal, setReveal] = useState(false)
  const url = `webcal://my.cactuspeakathletic.example/api/calendar/${prefs.calendarToken}.ics`
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-label">Your calendar feed</p>
        <div className="flex gap-2">
          <Input
            aria-label="Feed URL"
            readOnly
            value={
              reveal
                ? url
                : "webcal://my.cactuspeakathletic.example/api/calendar/••••••••••.ics"
            }
            className="num"
          />
          <Button
            variant="outline"
            size="icon"
            aria-label={reveal ? "Hide feed URL" : "Reveal feed URL"}
            onClick={() => setReveal(!reveal)}
          >
            <Eye aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              void navigator.clipboard?.writeText(url)
              toast({ title: "Link copied" })
            }}
          >
            <Copy aria-hidden="true" data-icon="inline-start" />
            Copy
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button render={<a href={url} />}>Subscribe</Button>
          <Button
            variant="outline"
            onClick={() => {
              resetCalendarToken()
              toast({
                title: "Calendar link reset",
                description: "Update the link in your calendar app.",
              })
            }}
          >
            Reset link
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <SwitchRow
          checked={prefs.calIncludeHousehold}
          onChange={(c) => setPrefs(me.id, { calIncludeHousehold: c })}
        >
          Include my household
        </SwitchRow>
        <SwitchRow
          checked={prefs.calIncludeKids}
          onChange={(c) => setPrefs(me.id, { calIncludeKids: c })}
        >
          Include kids club
        </SwitchRow>
      </div>
      <Banner tone="neutral" title="Arizona doesn't use daylight saving.">
        Your calendar may shift times if it is set to another time zone.
        Cancelled bookings leave the feed. Held spots join it once you confirm.
      </Banner>
    </div>
  )
}

export function SecuritySettings() {
  const { prefs, me } = useApp()
  const router = useRouter()
  const [all, setAll] = useState(false)
  const [pw, setPw] = useState(false)
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h3 className="text-label">Passkeys</h3>
        {prefs.passkeys.length ? (
          <ul className="rule-rows">
            {prefs.passkeys.map((p) => (
              <li
                key={p}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="flex items-center gap-2">
                  <KeyRound
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {p}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    removePasskey(p)
                    toast({ title: "Passkey removed" })
                  }}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-muted-foreground">
            No passkeys yet. A passkey signs you in with your fingerprint or
            face.
          </p>
        )}
        <Button
          variant="outline"
          className="w-fit"
          onClick={() => {
            addPasskey(`This device, ${new Date().getFullYear()}`)
            toast({ title: "Passkey added" })
          }}
        >
          Add a passkey
        </Button>
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-label">Password</h3>
        <p className="text-body text-muted-foreground">
          You sign in with an email code or a passkey. A password is optional.
        </p>
        <Button variant="outline" className="w-fit" onClick={() => setPw(true)}>
          Set a password
        </Button>
        {pw ? (
          <div className="max-w-sm">
            <FormField
              label="New password"
              help="Paste is fine. A password manager works."
            >
              {(p) => (
                <Input {...p} type="password" autoComplete="new-password" />
              )}
            </FormField>
            <Button
              className="mt-3"
              onClick={() => {
                setPw(false)
                toast({ title: "Password saved" })
              }}
            >
              Save password
            </Button>
          </div>
        ) : null}
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-label">Signed-in devices</h3>
        <ul className="rule-rows">
          {[
            ["This browser", "Chrome on Mac · Mesa, AZ · now", Laptop],
            [
              "iPhone",
              "Cactus Peak app · Gilbert, AZ · 2 hours ago",
              Smartphone,
            ],
          ].map(([a, b, Icon]) => {
            const I = Icon as typeof Laptop
            return (
              <li
                key={a as string}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="flex items-center gap-3">
                  <I
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-label">{a as string}</span>
                    <span className="block text-caption text-muted-foreground">
                      {b as string}
                    </span>
                  </span>
                </span>
                {a !== "This browser" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast({ title: "Signed out on iPhone" })}
                  >
                    Sign out
                  </Button>
                ) : (
                  <Check
                    className="size-4 text-success"
                    aria-label="Current device"
                  />
                )}
              </li>
            )
          })}
        </ul>
        <Button
          variant="outline"
          className="w-fit"
          onClick={() => setAll(true)}
        >
          Sign out everywhere
        </Button>
      </section>
      <Confirm
        open={all}
        onOpenChange={setAll}
        title="Sign out on all devices?"
        description="You'll need to sign in again on each one."
      >
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setAll(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={async () => {
              await signOut("global").catch(() => undefined)
              router.replace("/sign-in")
              router.refresh()
            }}
          >
            Sign out everywhere
          </Button>
        </div>
      </Confirm>
      <span className="sr-only">{me.id}</span>
    </div>
  )
}

export function DisplaySettings() {
  const { me, prefs } = useApp()
  const { setTheme } = useTheme()
  return (
    <div className="flex flex-col gap-8">
      <RadioList
        label="Theme"
        value={prefs.theme}
        onChange={(v) => {
          setTheme(v)
          setPrefs(me.id, { theme: v })
        }}
        options={[
          { value: "system", label: "System" },
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
      />
      <RadioList
        label="Motion"
        value={prefs.motion}
        onChange={(v) => {
          setPrefs(me.id, { motion: v })
          document.documentElement.dataset.motion =
            v === "reduce" ? "reduce" : ""
        }}
        options={[
          { value: "system", label: "Follow my device" },
          { value: "reduce", label: "Reduce motion" },
        ]}
      />
      <RadioList
        label="Text size"
        value={prefs.textSize}
        onChange={(v) => {
          setPrefs(me.id, { textSize: v })
          document.documentElement.dataset.text = v === "large" ? "large" : ""
        }}
        options={[
          { value: "default", label: "Default" },
          {
            value: "large",
            label: "Large",
            help: "Sets the base text to 18 px. Layouts reflow.",
          },
        ]}
      />
      <dl className="text-body rule-rows">
        <div className="flex justify-between py-3">
          <dt>Time format</dt>
          <dd className="text-muted-foreground">12-hour</dd>
        </div>
        <div className="flex justify-between py-3">
          <dt>Language</dt>
          <dd className="text-muted-foreground">English</dd>
        </div>
      </dl>
    </div>
  )
}

export function PrivacySettings() {
  const { me, prefs } = useApp()
  const [del, setDel] = useState(false)
  return (
    <div className="flex flex-col gap-6">
      {me.role === "teen" ? (
        <Banner
          tone="neutral"
          title="Your parent can see your bookings and check-ins."
        />
      ) : null}
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="w-fit"
          onClick={() =>
            toast({
              title: "We'll email your data",
              description: "A download link arrives within 24 hours.",
            })
          }
        >
          Download my data (ZIP)
        </Button>
        <p className="text-detail text-muted-foreground">
          We email a link within 24 hours.
        </p>
      </div>
      <CheckRow
        checked={prefs.marketing}
        onChange={(c) => {
          setPrefs(me.id, { marketing: c })
          toast({ title: "Saved" })
        }}
      >
        Send me offers and club news by email
      </CheckRow>
      <div className="flex flex-col gap-2 pt-4 rule-t">
        <Button
          variant="outline"
          className="w-fit !text-destructive"
          onClick={() => setDel(true)}
        >
          Delete my account
        </Button>
      </div>
      <Confirm
        open={del}
        onOpenChange={setDel}
        title="Delete your account?"
        description={
          me.role === "primary"
            ? "Cancel your membership first. Deleting an account with an active plan isn't possible."
            : "This removes your profile and bookings. It can't be undone."
        }
      >
        <div className="flex flex-col gap-2">
          {me.role === "primary" ? (
            <Button className="w-full" render={<a href="/membership/cancel" />}>
              Cancel membership first
            </Button>
          ) : (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                setDel(false)
                toast({
                  title: "Request sent",
                  description: "We'll confirm by email.",
                })
              }}
            >
              Delete my account
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setDel(false)}
          >
            Keep my account
          </Button>
        </div>
      </Confirm>
      <span className="sr-only">{fmtMoney(0)}</span>
    </div>
  )
}
