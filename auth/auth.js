// Initialiser le client Supabase
const supabaseUrl = 'https://drtsuhnbclhmgfjiykap.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydHN1aG5iY2xobWdmaml5a2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NDIzODksImV4cCI6MjA5NDQxODM4OX0.68cvRa8xhrSDt2nnEEp7pagL7NT5ugRtOhKLGX2CQJg';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Inscription
document.getElementById('signup-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        alert('Erreur lors de l\'inscription : ' + error.message);
    } else {
        alert('Inscription réussie ! Veuillez vérifier votre e-mail pour confirmer votre compte.');
        window.location.href = 'connexion.html';
    }
});

// Connexion
document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert('Erreur lors de la connexion : ' + error.message);
    } else {
        alert('Connexion réussie !');
        window.location.href = '../index.html';
    }
});
// Mot de passe oublié
document.getElementById('forgot-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://votresite.com/auth/reset_password.html',
    });

    if (error) {
        alert('Erreur lors de la réinitialisation du mot de passe : ' + error.message);
    } else {
        alert('Un e-mail de réinitialisation de mot de passe a été envoyé à ' + email);
        window.location.href = 'connexion.html';
    }
});
