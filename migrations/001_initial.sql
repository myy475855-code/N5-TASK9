CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student','company','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internships (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  application_deadline TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internships_company_status ON internships(company_id,status);
CREATE INDEX IF NOT EXISTS idx_internships_deadline ON internships(application_deadline);

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  internship_id INTEGER NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','UNDER_REVIEW','ACCEPTED','REJECTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(internship_id,student_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship ON applications(internship_id);
