CREATE TABLE snippets (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Short public id used in share links, for example /s/k3j9x2mq7p
  slug       text NOT NULL UNIQUE,
  content    text NOT NULL DEFAULT '' CHECK (char_length(content) <= 100000),
  language   text NOT NULL DEFAULT 'plaintext',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
