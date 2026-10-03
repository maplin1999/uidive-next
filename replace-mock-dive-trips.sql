update public.dive_trips
set status = 'cancelled'
where status = 'active';

insert into public.dive_trips (
  title, description, location, trip_type, activity_type, difficulty,
  max_depth, visibility, water_temp, swell, wind, tide, current,
  conditions_updated_at, rating, price, capacity, spots_booked,
  scheduled_date, scheduled_time, image_url, highlight, host_id, status
)
select * from (values
  (
    'SS Thistlegorm Wreck Dive',
    'Dive the SS Thistlegorm, a British WWII supply ship torpedoed in 1941 and still carrying its original cargo of motorcycles, trucks, rifles and railway wagons. One of the most famous wreck dives on earth, with swim-throughs into the cargo holds for certified divers.',
    'Sha''ab Ali, Red Sea, Egypt',
    'boat', 'scuba', 'Advanced',
    '30m', '15-20m', '26C', 'Slight', 'Light', 'Slack preferred', 'Mild-Moderate',
    now(), 4.9, 95, 12, 0,
    '2026-10-10'::date, '08:00 AM',
    '/assets/trips/ss-thistlegorm.jpg',
    'Penetrate a WWII wreck still loaded with motorcycles, trucks and rifles.',
    null::uuid, 'active'
  ),
  (
    'Barracuda Point Drift Dive',
    'A sheer wall dive off Sipadan famous for its tornado of thousands of chevron barracuda circling just off the reef, alongside resident green and hawksbill turtles and the occasional grey reef shark. A fast-moving drift dive for experienced divers.',
    'Sipadan Island, Sabah, Malaysia',
    'boat', 'scuba', 'Advanced',
    '25m', '20-30m', '28C', 'Slight', 'Light', 'Variable', 'Strong (drift)',
    now(), 4.9, 110, 10, 0,
    '2026-10-14'::date, '07:30 AM',
    '/assets/trips/barracuda-point-sipadan.jpg',
    'Swim through a tornado of thousands of barracuda along a sheer wall.',
    null::uuid, 'active'
  ),
  (
    'Silfra Fissure Snorkel & Dive',
    'Dive or snorkel in the fissure between the North American and Eurasian tectonic plates, filled with glacier meltwater so pure it filters to over 100m visibility. Drysuit required, water is glacial year round. Calm, no current conditions make this accessible to confident Open Water divers.',
    'Thingvellir National Park, Iceland',
    'shore', 'freediving', 'Moderate',
    '18m', '100m+', '3C', 'None', 'Light', 'None', 'None',
    now(), 4.8, 150, 6, 0,
    '2026-10-17'::date, '10:00 AM',
    '/assets/trips/silfra-fissure.jpg',
    'Snorkel or dive between two continents in 100m+ visibility glacier water.',
    null::uuid, 'active'
  ),
  (
    'Cod Hole Reef Dive',
    'A relaxed, shallow reef dive on the outer Great Barrier Reef famous for its giant, famously friendly potato cod that approach divers closely. Vivid coral bommies and healthy fish life make this one of the best beginner friendly boat dives in the world.',
    'Ribbon Reefs, Great Barrier Reef, Australia',
    'boat', 'scuba', 'Easy',
    '18m', '15-25m', '27C', 'Slight', 'Light', 'Slack preferred', 'Mild',
    now(), 4.7, 180, 14, 0,
    '2026-10-21'::date, '07:00 AM',
    '/assets/trips/cod-hole-gbr.jpg',
    'Meet giant, famously friendly potato cod on a vivid coral reef.',
    null::uuid, 'active'
  ),
  (
    'Great Blue Hole Expedition',
    'Descend into the Great Blue Hole, a 125m wide, 125m deep marine sinkhole visible from space, to see ancient limestone stalactite formations at depth, remnants of when this cavern was dry, before sea levels rose. A full day boat expedition to Lighthouse Reef Atoll.',
    'Lighthouse Reef Atoll, Belize',
    'boat', 'scuba', 'Advanced',
    '40m', '30m+', '27C', 'Slight', 'Light', 'Slack preferred', 'None-Mild',
    now(), 4.8, 220, 8, 0,
    '2026-10-24'::date, '06:30 AM',
    '/assets/trips/great-blue-hole-belize.jpg',
    'Descend into a 125m-wide sinkhole past ancient stalactite formations.',
    null::uuid, 'active'
  ),
  (
    'Blue Corner Hook-In Dive',
    'Clip into the reef wall at Blue Corner and watch the show: grey reef sharks, eagle rays and dense schools of jacks and barracuda riding the current along one of the most famous wall dives in the Pacific. A fast paced drift/hook dive for experienced divers.',
    'Ngemelis Island, Palau',
    'boat', 'scuba', 'Advanced',
    '30m', '25-30m', '29C', 'Moderate', 'Light', 'Variable', 'Strong (drift/hook-in)',
    now(), 4.9, 130, 10, 0,
    '2026-10-28'::date, '08:30 AM',
    '/assets/trips/blue-corner-palau.jpg',
    'Hook into the wall and watch sharks and eagle rays ride the current.',
    null::uuid, 'active'
  )
) as new_trips(
  title, description, location, trip_type, activity_type, difficulty,
  max_depth, visibility, water_temp, swell, wind, tide, current,
  conditions_updated_at, rating, price, capacity, spots_booked,
  scheduled_date, scheduled_time, image_url, highlight, host_id, status
)
where not exists (
  select 1 from public.dive_trips existing where existing.title = new_trips.title
);
