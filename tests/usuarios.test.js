/**
 * @jest-environment jsdom
 */

const {
  isValidAdminPassword,
  buildNuevoUsuario,
  buildUsuarioActualizado,
  createUserCard,
} = require("../front/usuarios.js");


describe("Pruebas unitarias usuarios.js", () => {

  // ============================================================
  // 1) Validar contraseña de admin
  // ============================================================
  test("isValidAdminPassword debe regresar true con contraseña correcta", () => {
    expect(isValidAdminPassword("admin123")).toBe(true);
  });

  test("isValidAdminPassword debe regresar false con contraseña incorrecta", () => {
    expect(isValidAdminPassword("12345")).toBe(false);
  });

  // ============================================================
  // 3) buildNuevoUsuario
  // ============================================================
  test("buildNuevoUsuario debe construir correctamente el usuario nuevo", () => {
    const user = buildNuevoUsuario(
      "Juan Perez",
      "ADMIN",
      "juanp@example.com",
      "1234"
    );

    expect(user).toEqual({
      nombre_usuario: "juanp",
      nombre_completo: "Juan Perez",
      correo: "juanp@example.com",
      contraseña: "1234",
      rol: "ADMIN",
    });
  });

  // ============================================================
  // 4) buildUsuarioActualizado
  // ============================================================
  test("buildUsuarioActualizado no debe incluir contraseña si está vacía", () => {
    const user = buildUsuarioActualizado(
      "Nuevo Nombre",
      "nuevo@mail.com",
      "Cajero",
      ""
    );

    expect(user).toEqual({
      nombre_completo: "Nuevo Nombre",
      correo: "nuevo@mail.com",
      rol: "Cajero",
    });
  });

  test("buildUsuarioActualizado debe incluir contraseña si se envía una nueva", () => {
    const user = buildUsuarioActualizado(
      "Nuevo Nombre",
      "nuevo@mail.com",
      "Cajero",
      "abcd"
    );

    expect(user).toEqual({
      nombre_completo: "Nuevo Nombre",
      correo: "nuevo@mail.com",
      rol: "Cajero",
      contraseña: "abcd",
    });
  });

  // ============================================================
  // 5) createUserCard
  // ============================================================
  test("createUserCard debe generar una tarjeta correcta de usuario", () => {
    const usuario = {
      id_usuario: 10,
      nombre_completo: "Carlos López",
      rol: "Supervisor",
      correo: "carlos@example.com",
    };

    const card = createUserCard(usuario);

    expect(card.className).toBe("user-card");
    expect(card.getAttribute("data-id")).toBe("10");
    expect(card.getAttribute("data-email")).toBe("carlos@example.com");
    expect(card.innerHTML).toContain("Carlos López");
    expect(card.innerHTML).toContain("Supervisor");
  });
});
