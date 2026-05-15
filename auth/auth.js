// Initialiser le client Supabase
const supabaseUrl = 'https://drtsuhnbclhmgfjiykap.supabase.co';
const supabaseKey = 'sb_publishable_H25biWVRSWp7t6SQ2zsGog_iVLyOnez';
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
