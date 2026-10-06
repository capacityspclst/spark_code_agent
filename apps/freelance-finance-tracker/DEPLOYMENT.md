# DEPLOYMENT.md

## What this app is
`freelance-finance-tracker` is a **FastAPI‑based web service** that lets freelancers:
* Register and log in via JWT‑based authentication.
* Upload CSV transaction files and receipt images (both currently stub‑bed).
* Store users and their transactions in a relational database (SQLite by default, replaceable with Postgres, MySQL, etc.).

The first version ships with SQLite for local development, but production should run against a managed DB.

---

## Architecture
```
[Client] -> HTTPS -> [Reverse Proxy / Platform HTTPS] -> FastAPI (Uvicorn) -> PostgreSQL (managed)
```
* **FastAPI app** (`apps/freelance-finance-tracker/main.py`) runs under **Uvicorn**.
* **SQLAlchemy** ORM (`database.py`, `models.py`) talks to the DB.
* **JWT** (`auth.py`, `dependencies.py`) secures the upload endpoints.
* **Optional reverse‑proxy** (Nginx / Cloudflare) terminates TLS and injects security headers.
* **Health endpoint** (to be added) for orchestration platforms.

Key files:
| File | Purpose |
|------|---------|
| `main.py` | FastAPI entry point, router inclusion, CORS middleware |
| `config.py` | Reads env vars (`SECRET_KEY`, `ALGORITHM`, `DATABASE_URL`, `ACCESS_TOKEN_EXPIRE_MINUTES`) |
| `database.py` | Engine, `SessionLocal`, `Base`, `get_db` dependency |
| `models.py` | `User` & `Transaction` ORM definitions |
| `schemas.py` | Pydantic request/response models |
| `auth.py` | Password hashing (bcrypt), JWT creation/verification |
| `dependencies.py` | `get_current_user` JWT auth dependency |
| `routers.py` | Auth routes (`/auth`) and upload routes (`/transactions`) |
| `requirements.txt` | Pin‑ed production dependencies |

---

## Prerequisites
| Tool | Version | Reason |
|------|---------|--------|
| Python | >=3.11 | Matches `requirements.txt` typings |
| Docker | >=24.0 | Needed for production image |
| Git | any | Source control |
| AWS CLI / Flyctl / Render CLI / gcloud | latest | For chosen hosting provider |
| `psql` or `psql`‑compatible client | optional | To inspect the production DB |
| `uvicorn` (installed via `requirements.txt`) | – | ASGI server for local dev |

Local dev commands (run from `apps/freelance-finance-tracker`):
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
The app listens on **port 8000** by default.

---

## Configuration and secrets
All configuration comes from environment variables defined in `config.py`.

| Variable | Default | Description | Production source |
|----------|---------|-------------|-------------------|
| `SECRET_KEY` | random 32‑byte URL‑safe string | JWT signing secret | Cloud provider secret manager (e.g., AWS Secrets Manager, Fly.io secrets) |
| `ALGORITHM` | `HS256` | JWT algorithm (validated against `HS256, HS384, HS512`) | Secret manager (same as above) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token TTL | Secret manager (optional) |
| `DATABASE_URL` | `sqlite:///./test.db` | SQLAlchemy DB URL | Managed DB connection string (Postgres, MySQL, etc.) |
| `PORT` | `8000` | Port Uvicorn listens on (overridden by container runtime) | Container env var |

**To‑do**: Create a `.env.example` file showing all vars and add a `docker-compose.yml` for local Postgres testing.

```text
# .env.example
SECRET_KEY= # generated secret (do NOT commit)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql://user:password@hostname:5432/dbname
PORT=8000
```

---

## Build and test
```bash
# 1. Install deps
pip install -r requirements.txt

# 2. Run unit / integration tests (add your tests under tests/)
pytest -q

# 3. Lint & type‑check
ruff check .
mypy .

# 4. Build Docker image
docker build -t freelance-finance-tracker:latest .
```

**Dockerfile** (needs to be added – *to‑do*):

```dockerfile
# TODO: Add production Dockerfile
FROM python:3.12-slim-bookworm AS builder
WORKDIR /app
# Install build deps
RUN pip install --upgrade pip && pip install poetry
COPY pyproject.toml poetry.lock ./
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes
COPY . .
RUN pip install -r requirements.txt --no-cache-dir

# Runtime stage – non‑root user, slim base
FROM python:3.12-slim-bookworm
WORKDIR /app
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
COPY --from=builder /app /app
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

*Add a `/health` endpoint in `main.py` before production.*

---

## Deploy
### 1. Choose a host
| Provider | TL;DR | Trade‑offs |
|----------|-------|------------|
| **Fly.io** | Quick, free tier, built‑in TLS, auto‑scale | Limited region diversity on free tier |
| **Render** | Managed containers, easy DB add‑on, free SSL | Slightly slower cold‑starts |
| **Google Cloud Run** | Serverless, per‑request billing, automatic scaling | Requires Google Cloud project & IAM |
| **AWS ECS Fargate** | Full AWS ecosystem, fine‑grained IAM, RDS integration | More complex setup, higher baseline cost |

All options support **environment‑variable secret injection**, **HTTPS**, and **Docker image deployment**.

### 2. Deploy steps (example using Fly.io)

```bash
# a) Install Flyctl and login
curl -L https://fly.io/install.sh | sh
fly auth login

# b) Create an app (once)
fly apps create freelance-finance-tracker

# c) Set secrets (replace <value>)
fly secrets set SECRET_KEY=$(openssl rand -base64 32)
fly secrets set ALGORITHM=HS256
fly secrets set DATABASE_URL="postgresql://user:pw@hostname:5432/dbname"
fly secrets set ACCESS_TOKEN_EXPIRE_MINUTES=30

# d) Deploy
fly deploy --image=registry.fly.io/freelance-finance-tracker:latest
```

**Render example** (Docker):

```bash
# In Render dashboard:
# 1) Create a new "Web Service"
# 2) Point to your Git repo, select Dockerfile
# 3) Add environment variables (same as above)
# 4) Attach a managed PostgreSQL instance, copy its URL into DATABASE_URL
# 5) Deploy
```

**GCP Cloud Run**:

```bash
gcloud builds submit --tag gcr.io/$PROJECT_ID/freelance-finance-tracker
gcloud run deploy freelance-finance-tracker \
  --image gcr.io/$PROJECT_ID/freelance-finance-tracker \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SECRET_KEY=$(openssl rand -base64 32),ALGORITHM=HS256,DATABASE_URL=...,ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**AWS ECS Fargate** *(high‑level)*:
1. Push Docker image to ECR.
2. Create ECS task definition (port 8000, env vars from Secrets Manager).
3. Set up an Application Load Balancer with TLS certificate from ACM.
4. Deploy service in a VPC with a **RDS PostgreSQL** instance.

### 3. Managed Database
| Provider | Quick‑setup | Backups | Scaling |
|----------|-------------|---------|---------|
| Supabase (Postgres) | 5 min via UI | Automated daily snapshots | Horizontal read replicas |
| AWS RDS (Postgres) | CLI / console | Automated backups, point‑in‑time | Multi‑AZ, read replicas |
| Render Postgres | 1‑click | Daily snapshots | Vertical scaling |

Set the `DATABASE_URL` accordingly.

### 4. TLS & Reverse Proxy
*All platforms listed provide **automatic TLS** (via Let's Encrypt or ACM).*
If you use a custom reverse proxy (Nginx), add:

```nginx
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options SAMEORIGIN;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header Content-Security-Policy "default-src 'self'";
```

### 5. Health Check
Add to `main.py`:

```python
@app.get("/health")
def health():
    return {"status": "ok"}
```

The Dockerfile `HEALTHCHECK` (shown earlier) will call it.

### 6. Logging & Metrics
* Use **structured JSON logs** via `loguru` or the built‑in FastAPI logger.
* Export metrics to **Prometheus** (use `starlette_exporter` middleware) or to the hosting platform's built‑in metrics.

---

## Security checklist
- [ ] **missing-rate-limiting-auth** – Add `slowapi` middleware with `5/min` login, `3/min` register limits. (`routers.py`)
- [ ] **missing-rate-limiting-uploads** – Apply same middleware to upload endpoints (`10/min` per user/IP). (`routers.py`)
- [ ] **no-file-upload-size-limit** – Enforce `max 5 MiB` for CSV, `2 MiB` for receipts in `routers.py` (read `UploadFile` size).  
- [ ] **email-enumeration-registration** – Return a generic message; hide existence of email. (`routers.py`)
- [ ] **unvalidated-upload-content-type** – Whitelist MIME types (`text/csv`, `image/png`, `image/jpeg`). (`routers.py`)
- [ ] **weak-password-hashing-algorithm** – Switch `CryptContext` to `schemes=["bcrypt"]` (or Argon2). (`auth.py`)
- [ ] **openapi-docs-exposed** – Disable docs in production: `FastAPI(docs_url=None, redoc_url=None, openapi_url=None)`. (`main.py`)
- [ ] **cors-allow-credentials-enabled** – Set `allow_credentials=False` unless needed. (`main.py`)
- [ ] **missing-security-headers** – Add middleware or reverse‑proxy headers (`X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`). (`main.py` or Nginx)
- [ ] **Add /health endpoint** – Required for container orchestration health checks. (`main.py`)
- [ ] **Add production Dockerfile** – Non‑root user, slim base, health check. (`Dockerfile`)
- [ ] **Enable rate limiting middleware** – Install `slowapi` (`pip install slowapi`) and configure globally. (`main.py`)
- [ ] **Set proper CORS (origins-only, no wide‑open methods/headers)** – Review `allow_methods`/`allow_headers`. (`main.py`)

---

## Operations
| Area | How‑to |
|------|--------|
| **Logs** | Stream Docker logs to CloudWatch (AWS), Stackdriver (GCP), or Fly.io logs. Configure JSON format for ingestion. |
| **Metrics** | Enable `starlette_exporter` → Prometheus; use platform dashboards (Render Metrics, Fly.io Metrics). |
| **Backups** | If using managed Postgres, enable daily automated snapshots. For self‑hosted DB, schedule `pg_dump` to object storage daily. |
| **Restore** | Restore via managed console or `pg_restore`. Keep a tested restore script in `ops/restore.sh`. |
| **Scaling** | Horizontal autoscaling handled by platform (e.g., Cloud Run auto‑scales, Fly.io “scale count”). Set `max_concurrency` or request limits as needed. |
| **Incident response** | 1) Pull latest logs (`fly logs` or `docker logs`). 2) Verify health endpoint (`curl https://api.example.com/health`). 3) Roll back via Docker tag (`fly deploy --image <previous-tag>`). |
| **Secrets rotation** | Rotate `SECRET_KEY` through secret manager UI; restart service to pick up new value. |
| **Database migrations** | Use Alembic (not yet added – *to‑do*) for schema changes; run `alembic upgrade head` during CI/CD. |

---

## CI/CD
Example **GitHub Actions** workflow (`.github/workflows/ci-cd.yml`):

```yaml
name: CI / CD

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Cache pip
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: pip-${{ hashFiles('requirements.txt') }}
      - name: Install deps
        run: pip install -r requirements.txt
      - name: Lint
        run: ruff check .
      - name: Type check
        run: mypy .
      - name: Run tests
        run: pytest -q

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USER }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Build image
        run: |
          docker build -t ${{ secrets.DOCKERHUB_USER }}/freelance-finance-tracker:${{ github.sha }} .
      - name: Push image
        run: |
          docker push ${{ secrets.DOCKERHUB_USER }}/freelance-finance-tracker:${{ github.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Fly.io
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
        run: |
          flyctl deploy --image ${{ secrets.DOCKERHUB_USER }}/freelance-finance-tracker:${{ github.sha }} \
            --env SECRET_KEY=${{ secrets.PROD_SECRET_KEY }} \
            --env DATABASE_URL=${{ secrets.PROD_DATABASE_URL }}

## Costs
| Provider | Compute (≈ monthly) | Managed DB (≈ monthly) | TLS / CDN | Estimated total |
|----------|-------------------|------------------------|----------|-----------------|
| **Fly.io** | Free tier (3 vCPU hrs) + $5 for additional instances | Free tier (250 MB) or Supabase $25 for a small Postgres | Free automatic TLS | **$5 – $30** |
| **Render** | $7 / month for a 512 MiB web service | $7 / month for a hobby‑tier Postgres instance | Free TLS via Let’s Encrypt | **$14 – $30** |
| **Google Cloud Run** | $0.000024 per vCPU‑sec, $0.0000025 per GB‑sec (≈ $8 for a modest load) | Cloud SQL (Postgres) $15 – $30 depending on tier | Free managed TLS | **$25 – $60** |
| **AWS ECS Fargate** | $0.0405 per vCPU‑hr + $0.0045 per GB‑hr (≈ $20 for modest traffic) | RDS Postgres db.t3.micro ≈ $15 | ACM TLS free | **$35 – $80** |

Add a small budget for monitoring/alerts (e.g., $5 – $10/month for Datadog, New Relic, or CloudWatch custom metrics).

---

## Before production
1. **Rate limiting** – integrate `slowapi` (or similar) to enforce  
   * login ≤ 5 req/min per IP,  
   * registration ≤ 3 req/min per IP,  
   * upload endpoints ≤ 10 req/min per user/IP.  

2. **File size limits** – reject CSV > 5 MiB and receipt images > 2 MiB; return 400.

3. **MIME/type whitelist** – accept only `text/csv` for CSV uploads and `image/png`, `image/jpeg` for receipts.

4. **Password hashing** – switch `CryptContext` to `schemes=["bcrypt"]` (or Argon2) and re‑hash new passwords; plan migration for existing hashes.

5. **Hide user enumeration** – modify registration to return a generic success message regardless of email existence.

6. **Disable OpenAPI docs in prod** – instantiate FastAPI with `docs_url=None, redoc_url=None, openapi_url=None`.

7. **CORS tightening** – set `allow_credentials=False` (or remove) and keep the origin list strict (`http://localhost` for dev, specific domain for prod).

8. **Add security headers** – inject `X‑Content‑Type‑Options`, `X‑Frame‑Options`, `Content‑Security‑Policy`, `Strict‑Transport‑Security` via middleware or reverse‑proxy configuration.

9. **Add `/health` endpoint** for platform health checks; ensure Dockerfile `HEALTHCHECK` points to it.

10. **Create production Dockerfile** (non‑root user, slim base, health check) – see the “to‑do” Dockerfile in the Build section.

11. **Introduce migration tooling** – add Alembic (or similar) for schema changes and run migrations in CI/CD before deployment.

12. **Implement optional email verification** to complete the registration flow without exposing account existence.

13. **Set up structured logging & metrics** (JSON logs, Prometheus exporter) and configure alerts for error rates, latency, and DB health.

14. **Run a full external penetration test** on the deployed environment (TLS configuration, open ports, secret leakage, etc.) before handling real user data.

Once all items above are addressed and every checkbox in the **Security checklist** is ticked, the app is ready for production. Happy deploying!```
