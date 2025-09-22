const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function runAuthSmokeTests() {
  console.log('🧪 Running authentication smoke tests...\n');

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let testUserId = null;

  try {
    // Test 1: User signup
    console.log('1️⃣ Testing user signup...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    });

    if (signupError) {
      throw new Error(`Signup failed: ${signupError.message}`);
    }

    testUserId = signupData.user?.id;
    console.log('✅ Signup successful');

    // Test 2: Email verification (simulate)
    console.log('2️⃣ Testing email verification...');
    if (testUserId) {
      const { error: verifyError } = await supabaseAdmin.auth.admin.updateUserById(
        testUserId,
        { email_confirm: true }
      );
      
      if (verifyError) {
        throw new Error(`Email verification failed: ${verifyError.message}`);
      }
      console.log('✅ Email verification successful');
    }

    // Test 3: User signin
    console.log('3️⃣ Testing user signin...');
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signinError) {
      throw new Error(`Signin failed: ${signinError.message}`);
    }
    console.log('✅ Signin successful');

    // Test 4: Protected API access
    console.log('4️⃣ Testing protected API access...');
    const token = signinData.session?.access_token;
    
    if (!token) {
      throw new Error('No access token received');
    }

    // Test API endpoint (would need actual server running)
    console.log('✅ Token received successfully');

    // Test 5: User signout
    console.log('5️⃣ Testing user signout...');
    const { error: signoutError } = await supabase.auth.signOut();
    
    if (signoutError) {
      throw new Error(`Signout failed: ${signoutError.message}`);
    }
    console.log('✅ Signout successful');

    // Test 6: RLS policies
    console.log('6️⃣ Testing Row Level Security...');
    
    // Try to access user_profiles without authentication (should fail)
    const { data: unauthorizedData, error: unauthorizedError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (!unauthorizedError) {
      throw new Error('RLS not working - unauthorized access succeeded');
    }
    console.log('✅ RLS policies working correctly');

    console.log('\n🎉 All authentication smoke tests passed!');

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    process.exit(1);
  } finally {
    // Cleanup: Delete test user
    if (testUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(testUserId);
        console.log('🧹 Test user cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup test user:', cleanupError.message);
      }
    }
  }
}

// Run tests
runAuthSmokeTests();