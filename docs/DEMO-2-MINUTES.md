# Two-minute demonstration script — v1.12

Use only public/synthetic demonstration inputs. Rehearse before presenting; live latency may require more than two minutes. Read actual results instead of promising a specific outcome.

## Before the judges arrive

- Open Demo guide and select **Use compact presentation cues**. Choose a step with Previous cue / Next cue; changing steps does not run anything or verify completion.
- Check browser readiness if useful. Its timestamp is a local snapshot; it does not prove HIBP is reachable.
- Choose Live HIBP for a real lookup, or Practice for clearly labelled mock results. Never switch silently. Changing source clears current form/dashboard state.
- Keep DevTools Network ready for live privacy evidence. An optional second tab can retain a completed dashboard report. Leaving a page clears its form/run, so export first.

## 0:00–0:15 — The problem

“We screen passwords when they are chosen or changed. A hard-to-guess password can still have appeared in a breach. This prototype checks locally where possible and uses a privacy-preserving prefix lookup for breach screening. Authentication is simulated.”

## 0:15–0:40 — Rejection

Open signup, load the public breached demo, then explicitly select Check password securely.

- If live HIBP returns a match: “This observed match blocks simulated signup. The public fixture is also on our local blocklist.”
- In Practice: “This is a local mock match. It demonstrates rejection logic, not live exposure.”
- If the request fails: “The status is unknown and submission remains blocked. We do not treat failure as a clean result.”

Point to the requirement checklist and next-action guidance. Never describe every blocked example as proof of HIBP availability.

## 0:40–1:00 — Privacy evidence

Keep signup open. In live mode, expand privacy evidence and inspect the actual GET request in DevTools.

“The request path uses five SHA-1 prefix characters. We do not send the password, full hash or suffix. Exact comparison happens locally. HIBP still sees the prefix, IP address and timing; this is not perfect anonymity.”

In Practice, say: “No HIBP request exists in this run. Live network evidence requires a separate explicit live check.” Do not present the Lab or an explanatory diagram as a network capture.

## 1:00–1:20 — Acceptance and limits

Generate a random demo and explicitly check it. Simulate only if the actual result and all form requirements allow it.

“No known match is not a safety guarantee. Local rules and valid email still matter; reset also requires confirmation. This action clears inputs and creates no real account.”

If it cannot proceed, explain the shown blocker instead of changing the story to imply success.

## 1:20–1:45 — Dashboard

Open the prepared dashboard tab or run a suitable demonstration. Read its actual source, rate and successful coverage.

“These accounts are synthetic, not collected employee passwords. The rate divides matches by successfully checked inputs. Unknown and pending inputs are excluded and shown separately. Mock rates describe a designed corpus, not an organization.”

Export JSON for structured evidence; Print / Save as PDF produces a readable report. Comparisons need matching source, dataset, policy, scenario and complete coverage. Separate live runs have different datasets.

## 1:45–2:00 — Test Lab and close

Run Strong, but already exposed in the Lab if time permits, or prepare it in another tab.

“The Lab always mocks service responses while exercising shared checking functions. PASS means the expected behavior occurred, including correct rejection. Our work is the application, policy integration, privacy evidence and tests; HIBP provides the corpus and zxcvbn provides strength estimates.”

End with: “This is a tested browser prototype. Production authentication needs a separate trusted enforcement and identity design.” End presentation removes the cues without changing current page inputs.

## If something goes wrong

- Slow network: explain pending state and cancel if necessary. Cancelled work is not a successful check.
- Outage: show fail-closed behavior; manually select Practice only if you explicitly announce mock mode.
- Lost page state: run again with demonstration data. Do not claim cleared evidence still exists.
- Time runs short: prioritize rejection, privacy boundary and honest source/coverage. Never invent a result to finish the script.
