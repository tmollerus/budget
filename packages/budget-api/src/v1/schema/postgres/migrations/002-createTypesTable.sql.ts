export const migration002 = `
-- DDL generated by Postico 1.5.17
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE IF NOT EXISTS types (
    id SERIAL PRIMARY KEY,
    active boolean NOT NULL DEFAULT true,
    label character varying(50) NOT NULL,
    "dateCreated" timestamp with time zone NOT NULL DEFAULT now(),
    "dateModified" timestamp with time zone NOT NULL DEFAULT now()
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS types_pkey ON types(id int4_ops);
`;
