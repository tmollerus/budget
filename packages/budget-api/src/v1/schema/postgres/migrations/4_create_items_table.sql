-- DDL generated by Postico 1.5.17
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE items (
    guid character varying(36) PRIMARY KEY,
    active boolean NOT NULL DEFAULT true,
    budget_guid character varying(36) NOT NULL REFERENCES budgets(guid) ON DELETE CASCADE,
    type_id integer NOT NULL REFERENCES types(id),
    "settledDate" timestamp with time zone,
    amount numeric(10,2) NOT NULL DEFAULT 0.00,
    label character varying(50) NOT NULL DEFAULT ''::character varying,
    paid boolean NOT NULL DEFAULT false,
    "dateCreated" timestamp with time zone NOT NULL DEFAULT now(),
    "dateModified" timestamp with time zone NOT NULL DEFAULT now()
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX items_pkey ON items(guid text_ops);
