UPDATE t_p288352_240fps_site_project.products p
SET price = sub.total + CASE
    WHEN sub.total = 0 THEN 0
    WHEN sub.total >= 300000 THEN 10000
    WHEN sub.total >= 200000 THEN 7000
    WHEN sub.total > 150000 THEN 6000
    ELSE 5000
END,
updated_at = NOW()
FROM (
  SELECT p2.id,
    COALESCE(cpu.price,0)+COALESCE(gpu.price,0)+COALESCE(ram.price,0)+COALESCE(ssd.price,0)+COALESCE(mb.price,0)+COALESCE(cooler.price,0)+COALESCE(psu.price,0)+COALESCE(cs.price,0) AS total
  FROM t_p288352_240fps_site_project.products p2
  LEFT JOIN t_p288352_240fps_site_project.components_cpu cpu ON cpu.id = p2.cpu_id
  LEFT JOIN t_p288352_240fps_site_project.components_gpu gpu ON gpu.id = p2.gpu_id
  LEFT JOIN t_p288352_240fps_site_project.components_ram ram ON ram.id = p2.ram_id
  LEFT JOIN t_p288352_240fps_site_project.components_ssd ssd ON ssd.id = p2.ssd_id
  LEFT JOIN t_p288352_240fps_site_project.components_motherboard mb ON mb.id = p2.motherboard_id
  LEFT JOIN t_p288352_240fps_site_project.components_cooler cooler ON cooler.id = p2.cooler_id
  LEFT JOIN t_p288352_240fps_site_project.components_psu psu ON psu.id = p2.psu_id
  LEFT JOIN t_p288352_240fps_site_project.components_case cs ON cs.id = p2.case_id
) sub
WHERE p.id = sub.id AND p.auto_price = true;

UPDATE t_p288352_240fps_site_project.products SET markup = 0;
