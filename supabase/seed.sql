-- Fictional demonstration concerts; not real ticket offers.
insert into public.concerts(id,slug,title,artist,description,venue,city,starts_at,is_active) values
('10000000-0000-4000-8000-000000000001','senandung-malam','Senandung Malam 2027','Ruang Senja','Konser demo fiktif. Rayakan malam penuh melodi bersama Ruang Senja. Data ini hanya untuk pengembangan aplikasi.','Hall Nusantara','Jakarta','2027-07-17 12:00:00+00',true),
('10000000-0000-4000-8000-000000000002','beyond-the-noise','Beyond the Noise','Midnight Atlas','Konser demo fiktif. Pertemuan musik alternatif dan energi panggung yang hangat. Data ini hanya untuk pengembangan aplikasi.','Arena Merdeka','Bandung','2027-08-21 12:00:00+00',true),
('10000000-0000-4000-8000-000000000003','spectrum-live','Spectrum Live','Nova Collective','Konser demo fiktif. Pengalaman musik elektronik penuh warna. Data ini hanya untuk pengembangan aplikasi.','Convention Hall','Surabaya','2027-09-11 12:00:00+00',true);
insert into public.ticket_categories(id,concert_id,name,price,service_fee,quota) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Festival',750000,100000,100),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','VIP',1500000,175000,30),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002','Festival',650000,85000,80),
('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000003','General Admission',850000,100000,100);
