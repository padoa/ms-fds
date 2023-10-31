import { runWrappedQueries } from '@padoa/database';

import { sequelize } from '@helpers/database/index.js';

const setupDBQuery = `
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE SCHEMA IF NOT EXISTS fds;

ALTER SCHEMA fds OWNER TO postgres;

CREATE FUNCTION public.trigger_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
   BEGIN
     NEW.updated_at = CLOCK_TIMESTAMP();
     RETURN NEW;
   END;
   $$;


ALTER FUNCTION public.trigger_set_updated_at() OWNER TO postgres;
`;

export async function up(): Promise<void> {
  await runWrappedQueries(sequelize, [setupDBQuery]);
}
