# Agent pipeline runs

Each `run/<run id>` branch is one run of the multi-agent coding pipeline on the DGX Spark (planner, coder, reviewer via LiteLLM), opened as a pull request. Each commit is one agent step; `.agent-run/` holds the plan, reviews and transcript.
