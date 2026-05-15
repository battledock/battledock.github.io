// Initialiser le client Supabase
const supabaseUrl = 'https://drtsuhnbclhmgfjiykap.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydHN1aG5iY2xobWdmaml5a2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NDIzODksImV4cCI6MjA5NDQxODM4OX0.68cvRa8xhrSDt2nnEEp7pagL7NT5ugRtOhKLGX2CQJg';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Inscription
document.getElementById('signup-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const { user, error } = await supabase.auth.signUp({
    email: `${username}@votredomaine.com`,
    password: password,
  });

  if (error) {
    alert("Erreur lors de l'inscription : " + error.message);
  } else {
    // Stocker le nom d'utilisateur dans la base de données Supabase
    const { data, error } = await supabase
      .from('users')
      .insert({ username: username, user_id: user.id });

    if (error) {
      console.error("Erreur lors de l'enregistrement du nom d'utilisateur :", error);
    } else {
      alert('Inscription réussie !');
      window.location.href = 'connexion.html';
    }
  }
});
// Connexion
document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const { user, error } = await supabase.auth.signIn({
    email: `${username}@votredomaine.com`,
    password: password,
  });

  if (error) {
    alert('Erreur lors de la connexion : ' + error.message);
  } else {
    alert('Connexion réussie !');
    window.location.href = 'home.html';
  }
    }, 1000); // Délai de 1 seconde avant la redirection
});
// Mot de passe oublié
document.getElementById('forgot-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://battledock.github.io/auth/reset_password.html',
    });

    if (error) {
        alert('Erreur lors de la réinitialisation du mot de passe : ' + error.message);
    } else {
        alert('Un e-mail de réinitialisation de mot de passe a été envoyé à ' + email);
        window.location.href = 'connexion.html';
    }
});
// Réinitialisation du mot de passe
document.getElementById('forgot-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;

    // Recherchez l'utilisateur dans la base de données en fonction du nom d'utilisateur
    const { data: users, error } = await supabase
        .from('users')
        .select('user_id')
        .eq('username', username);

    if (error || users.length === 0) {
        alert("Nom d'utilisateur non trouvé.");
    } else {
        const userId = users[0].user_id;
        
        // Envoyez un e-mail de réinitialisation de mot de passe à l'utilisateur
        const { data, error } = await supabase.auth.api.resetPasswordForEmail(`${username}@votredomaine.com`);

        if (error) {
            alert("Erreur lors de l'envoi de l'e-mail de réinitialisation du mot de passe : " + error.message);
        } else {
            alert("Un e-mail de réinitialisation du mot de passe a été envoyé à votre adresse e-mail.");
        }
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
        .select('user_id')
        .eq('username', username);

    if (error || users.length === 0) {
        alert("Nom d'utilisateur non trouvé.");
    } else {
        const userId = users[0].user_id;
        
        // Mettez à jour le mot de passe de l'utilisateur
        const { user, error } = await supabase.auth.update({ password: newPassword });

        if (error) {
            alert("Erreur lors de la réinitialisation du mot de passe : " + error.message);
        } else {
            alert("Mot de passe réinitialisé avec succès !");
            window.location.href = 'connexion.html';
        }
    }
});
