# Spark code agent

Apps built by the multi-agent coding pipeline on the DGX Spark (planner, coder,
validators and reviewer, all running on a local model through LiteLLM).

- `apps/<name>/`: one folder per app. A new app gets a new folder; later requests
  that name the app change it in place.
- `apps/<name>/test_acceptance.py`: the app's acceptance tests, written by the planner.
- `apps/<name>/.agent-run/<run id>/`: the plan, review rounds, summary and full
  transcript of each run that built or changed the app.

Every run works on its own `run/<run id>` branch, with one commit per agent step, and
ends in a pull request. Nothing is merged automatically: PRs titled `[approved]`
passed tests, validation and review; `[needs work]` did not.
