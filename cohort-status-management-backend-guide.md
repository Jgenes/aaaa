# Cohort Status Management - Backend Implementation Guide

## Required Backend Changes for Automatic Cohort Status Updates

### 1. Database Migration (if needed)

Add `enrolled_students` column to cohorts table if it doesn't exist:

```php
Schema::table('cohorts', function (Blueprint $table) {
    $table->integer('enrolled_students')->default(0)->after('capacity');
});
```

### 2. Cohort Model Updates

Update the Cohort model to include automatic status calculation:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Cohort extends Model
{
    protected $fillable = [
        'course_id', 'intake_name', 'start_date', 'end_date',
        'schedule_text', 'mode', 'venue', 'online_link',
        'capacity', 'price', 'registration_deadline', 'status',
        'description', 'enrolled_students'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'registration_deadline' => 'date',
        'price' => 'decimal:2',
        'capacity' => 'integer',
        'enrolled_students' => 'integer'
    ];

    // Accessor for dynamic status calculation
    public function getDynamicStatusAttribute()
    {
        $now = Carbon::now();

        // If end date has passed, mark as ended
        if ($now->greaterThan($this->end_date)) {
            return 'ENDED';
        }

        // If enrollment deadline has passed, mark as closed
        if ($now->greaterThan($this->registration_deadline)) {
            return 'CLOSED';
        }

        // If at full capacity, mark as full
        if ($this->enrolled_students >= $this->capacity) {
            return 'FULL';
        }

        // Otherwise, use the stored status or default to open
        return $this->status ?? 'OPEN';
    }

    // Method to update status based on current conditions
    public function updateStatusBasedOnConditions()
    {
        $newStatus = $this->dynamic_status;

        if ($this->status !== $newStatus) {
            $this->update(['status' => $newStatus]);
            return true;
        }

        return false;
    }

    // Relationship with enrollments
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    // Accessor for remaining seats
    public function getRemainingSeatsAttribute()
    {
        return max(0, $this->capacity - $this->enrolled_students);
    }
}
```

### 3. Cohort Controller Updates

Add methods to handle status updates:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Cohort;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CohortController extends Controller
{
    // ... existing methods ...

    // Update cohort status
    public function updateStatus(Request $request, $courseId, $cohortId): JsonResponse
    {
        $cohort = Cohort::where('course_id', $courseId)->findOrFail($cohortId);

        $request->validate([
            'status' => 'required|in:OPEN,CLOSED,FULL,ENDED'
        ]);

        $cohort->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Cohort status updated successfully',
            'cohort' => $cohort
        ]);
    }

    // Refresh all cohort statuses for a course
    public function refreshStatuses($courseId): JsonResponse
    {
        $cohorts = Cohort::where('course_id', $courseId)->get();
        $updatedCount = 0;

        foreach ($cohorts as $cohort) {
            if ($cohort->updateStatusBasedOnConditions()) {
                $updatedCount++;
            }
        }

        return response()->json([
            'message' => "Updated {$updatedCount} cohort statuses",
            'updated_count' => $updatedCount
        ]);
    }

    // Update enrolled students count when enrollment occurs
    public function updateEnrolledCount($cohortId): void
    {
        $cohort = Cohort::findOrFail($cohortId);
        $enrolledCount = $cohort->enrollments()->where('status', 'active')->count();

        $cohort->update(['enrolled_students' => $enrolledCount]);

        // Automatically update status if needed
        $cohort->updateStatusBasedOnConditions();
    }
}
```

### 4. API Routes

Add the new routes to `routes/api.php`:

```php
// Cohort status management
Route::patch('/courses/{courseId}/cohorts/{cohortId}/status', [CohortController::class, 'updateStatus']);
Route::post('/courses/{courseId}/cohorts/refresh-statuses', [CohortController::class, 'refreshStatuses']);
```

### 5. Enrollment Observer/Model Events

Create an observer to automatically update enrolled count when enrollments change:

```php
<?php

namespace App\Observers;

use App\Models\Enrollment;
use App\Models\Cohort;

class EnrollmentObserver
{
    public function created(Enrollment $enrollment)
    {
        $this->updateCohortEnrolledCount($enrollment->cohort_id);
    }

    public function updated(Enrollment $enrollment)
    {
        $this->updateCohortEnrolledCount($enrollment->cohort_id);
    }

    public function deleted(Enrollment $enrollment)
    {
        $this->updateCohortEnrolledCount($enrollment->cohort_id);
    }

    private function updateCohortEnrolledCount($cohortId)
    {
        $cohort = Cohort::find($cohortId);
        if ($cohort) {
            $enrolledCount = $cohort->enrollments()->where('status', 'active')->count();
            $cohort->update(['enrolled_students' => $enrolledCount]);
            $cohort->updateStatusBasedOnConditions();
        }
    }
}
```

Register the observer in `AppServiceProvider`:

```php
public function boot()
{
    Enrollment::observe(EnrollmentObserver::class);
}
```

### 6. Scheduled Command (Optional)

Create a command to automatically update cohort statuses daily:

```php
php artisan make:command UpdateCohortStatuses
```

```php
<?php

namespace App\Console\Commands;

use App\Models\Cohort;
use Illuminate\Console\Command;

class UpdateCohortStatuses extends Command
{
    protected $signature = 'cohorts:update-statuses';
    protected $description = 'Update cohort statuses based on dates and enrollment';

    public function handle()
    {
        $cohorts = Cohort::all();
        $updatedCount = 0;

        foreach ($cohorts as $cohort) {
            if ($cohort->updateStatusBasedOnConditions()) {
                $updatedCount++;
                $this->info("Updated cohort {$cohort->id} to status {$cohort->status}");
            }
        }

        $this->info("Updated {$updatedCount} cohort statuses");
    }
}
```

Add to scheduler in `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('cohorts:update-statuses')->daily();
}
```

### 7. Frontend Integration

The frontend will now show:

- ✅ Remaining seats calculation
- ✅ Automatic status updates (ENDED, CLOSED, FULL, OPEN)
- ✅ Visual progress bars for enrollment
- ✅ Manual refresh button for status updates

## Status Logic:

- **OPEN**: Default status, enrollment open
- **CLOSED**: Enrollment deadline passed
- **FULL**: At maximum capacity
- **ENDED**: Course end date passed

## API Response Format:

Cohorts should include `enrolled_students` field in the response for proper remaining seats calculation.
