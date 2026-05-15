// Inscription
document.getElementById('signup-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  console.log("Formulaire d'inscription soumis");

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  console.log("Nom d'utilisateur :", username);
  console.log("Mot de passe :", password);

  const { data, error } = await supabase
    .from('users')
    .insert({ username: username, password: password });

  if (error) {
    console.error("Erreur lors de l'inscription :", error);
    alert("Erreur lors de l'inscription : " + error.message);
  } else {
    console.log("Inscription réussie :", data);
    alert('Inscription réussie !');
    window.location.href = 'connexion.html';
  }
});

// Connexion
document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error) {
    alert('Erreur lors de la connexion : ' + error.message);
  } else {
    alert('Connexion réussie !');
    window.location.href = 'home.html';
  }
});

// Réinitialisation du mot de passe (après avoir cliqué sur le lien dans l'e-mail)
document.getElementById('reset-password-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (newPassword !== confirmPassword) {
    alert("Les mots de passe ne correspondent pas.");
    return;
  }

  // Recherchez l'utilisateur dans la base de données en fonction du nom d'utilisateur
  const { data: users, error } = await supabase
    .from('users')
    .select('id')
    .eq('username', username);

  if (error || users.length === 0) {
    alert("Nom d'utilisateur non trouvé.");
  } else {
    const userId = users[0].id;

    // Mettez à jour le mot de passe de l'utilisateur
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      alert("Erreur lors de la réinitialisation du mot de passe : " + error.message);
    } else {
      alert("Mot de passe réinitialisé avec succès !");
      window.location.href = 'connexion.html';
    }
  }
});
