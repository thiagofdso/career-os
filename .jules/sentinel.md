## 2025-05-06 - [Overly Permissive CORS Configuration]
**Vulnerability:** The Express backend was using `app.use(cors())` without any configuration, allowing any origin to make requests to the API.
**Learning:** The default `cors()` configuration in Express allows all origins (`*`). This is a security risk as any domain can send cross-origin requests to our API. The memory explicitly stated that "Backend CORS policy is restricted to origins listed in the ALLOWED_ORIGINS environment variable (comma-separated), with a default fallback to http://localhost:3000", but it wasn't implemented.
**Prevention:** Always explicitly configure the `origin` option in `cors()` to restrict access to trusted domains, using an environment variable for flexibility across environments.
