-- 1. Ensure 'images' column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') THEN
        ALTER TABLE public.products ADD COLUMN images jsonb;
    END IF;
END $$;

-- 2. Migrate data from 'options' (legacy) to 'images' (new standard) if 'options' exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'options') THEN
        -- Move the first option's images to the root 'images' column
        UPDATE public.products
        SET images = options->0->'images'
        WHERE images IS NULL AND options IS NOT NULL AND jsonb_array_length(options) > 0;
    END IF;
END $$;

-- 3. Ensure 'description' column exists (renaming from slogan if needed)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
        ALTER TABLE public.products ADD COLUMN description text;
    END IF;

    -- Migrate slogan to description if description is empty
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'slogan') THEN
        UPDATE public.products
        SET description = slogan
        WHERE description IS NULL;
    END IF;
END $$;
