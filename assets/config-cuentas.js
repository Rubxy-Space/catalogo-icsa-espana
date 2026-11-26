/* Catálogo General ICSA España · conexión de las cuentas con Supabase

   Vacío = sin servidor: en el ordenador de desarrollo se usa el modo de prueba y en la web publicada no hay cuentas.
   Con la dirección del proyecto y su clave pública («Project URL» y «Publishable key» o «anon key» en
   Project Settings > API Keys), las cuentas pasan a ser de verdad. Esas dos cosas están hechas para ir en la web;
   la clave secreta (service_role o secret) nunca va aquí. Pasos en supabase/LEEME-supabase.md. */
window.ICSA_CUENTAS = {
  url: "https://ketaoqjxsqeczsefqzhf.supabase.co",
  clave: "sb_publishable_4wqqa3ZmoiO-rv4LT05DkA_hImwCzxS"
};
