// Inscription
document.getElementById('signup-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  console.log("Formulaire d'inscription soumis");
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  console.log("Nom d'utilisateur :", username);
  console.log("Mot de passe :", password);
  
  try {
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
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    alert("Erreur lors de l'inscription : " + error.message);
  }
});

// Connexion
document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
    
    if (error) {
      console.error("Erreur lors de la connexion :", error);
      alert('Erreur lors de la connexion : ' + error.message);
    } else {
      console.log("Connexion réussie :", data);
      alert('Connexion réussie !');
      window.location.href = 'home.html';
    }
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    alert("Erreur lors de la connexion : " + error.message);
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
  
  try {
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username);
    
    if (userError || users.length === 0) {
      console.error("Erreur lors de la recherche de l'utilisateur :", userError);
      alert("Nom d'utilisateur non trouvé.");
    } else {
      const userId = users[0].id;
      
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );
      
      if (updateError) {
        console.error("Erreur lors de la réinitialisation du mot de passe :", updateError);
        alert("Erreur lors de la réinitialisation du mot de passe : " + updateError.message);
      } else {
        console.log("Mot de passe réinitialisé avec succès :", updateData);
        alert("Mot de passe réinitialisé avec succès !");
        window.location.href = 'connexion.html';
      }
    }
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe :", error);
    alert("Erreur lors de la réinitialisation du mot de passe : " + error.message);
  }
});
