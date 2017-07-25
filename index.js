(function (window) {
	'use strict';

	//Global variables
	var Units;
	var Attacker;
	var Defender;
	var Strike;
	var DefScore;

	// Global Defense variables
	var AAdef = null;
	var AGdef = null;
	var ASdef = null;
	var CAdef = null;
	var Gdef = null;
	var Tdef = null;
	var Udef = null;

	loadUnits();

	function loadUnits () {
		// First get file from server using ajax
		$.ajax({
			type: 'GET',
			url: 'units.csv',
			dataType: 'text',
			success: function (unitsData) {
				// Next, use jquery-csv to parse
				var units = $.csv.toObjects(unitsData);
				console.log(units);
				Units = units; // write to global
				populateCombatants(units);
			}
		});
	}

	function populateCombatants (units) {
		// Write unit info to dropdowns (must be done before instantiating selectizes)
		var html;
		for (var i = 0; i < units.length; i++) {
			html += '<option value="' + units[i].unitId + '">' + units[i].type + ' - ' + units[i].typeUnit + '</option>';
		}
		$('#attackingUnit').html('<option value="" disabled selected style="display:none;">Select Attacking Unit</option>' + html);
		$('#defendingUnit').html('<option value="" disabled selected style="display:none;">Select Defending Unit</option>' + html);

		instantiateSelectize();
	}

	function instantiateSelectize () {
		// Set up the selectizes.
		$('#attackingUnit').selectize({
		});

		$('#defendingUnit').selectize({
		});
	}

// ==================== Defense Calculations ====================

	$('#btnSubmitCombatants').on('click', readCombatants);

	function readCombatants () {
		var attacker = null;
		var defender = null;
		for (var i = 0; i < Units.length; i++) {
			if (Units[i].unitId === $('#attackingUnit').val()) {
				attacker = Units[i];
				break;
			}
		}
		for (var j = 0; j < Units.length; j++) {
			if (Units[j].unitId === $('#defendingUnit').val()) {
				defender = Units[j];
				break;
			}
		}
		Attacker = attacker;
		console.log('Attacker');
		console.log(attacker);
		Defender = defender;
		console.log('Defender');
		console.log(defender);
		combatRouter();
	}

	function combatRouter () {
		console.log('combatRouter');
		// Reset global defense values to null in case they have been modified
		AAdef = null;
		AGdef = null;
		ASdef = null;
		CAdef = null;
		Gdef = null;
		Tdef = null;
		Udef = null;

		// determine what type of unit the defender is
		if (Defender.type === 'Surface Naval') {
			promptSurfaceNavalLocation();
		} else if (Defender.type === 'Submarine') {
			switch (promptSubmarineLocation()) {
				case 'sea':
					console.log('sea');
					Tdef = 8;
					Udef = 8;
					break;
				case 'port':
					console.log('port');
					ASdef = 8;
					var subAMD = promptAMDInRange();
					if (subAMD > ASdef) {
						ASdef = subAMD;
					}
					break;
				default:
					console.log('ERROR INVALID LOCATION');
			}
			showDefenderDefenseScores();
			showValidWeaponsSystems(Attacker, AAdef, AGdef, ASdef, CAdef, Gdef, Tdef, Udef);
		} else if (Defender.type === 'Air') {
			AAdef = parseFloat(Defender.md); // TODO can air be defended by area missile defense?
			showDefenderDefenseScores();
			showValidWeaponsSystems(Attacker, AAdef, AGdef, ASdef, CAdef, Gdef, Tdef, Udef);
		} else if (Defender.type === 'Ground') {
			CAdef = 9;
			Gdef = 9;
			console.log(Defender.md);
		}
	}

	function promptSurfaceNavalLocation () {
		bootbox.dialog({
			closeButton: false,
			animate: false,
			title: 'Unit Location',
			message: 'Is the defending unit located at sea or in port?',
			buttons: {
				btnSea: {
					label: 'At Sea',
					className: 'btn-primary',
					callback: callbackSea
				},
				btnPort: {
					label: 'In Port',
					className: 'btn-primary',
					callback: callbackPort
				}
			}
		});

		function callbackSea () {
			console.log('sea');
			Gdef = 9;
			Tdef = 8;
			ASdef = parseFloat(Defender.md); // Always parse the numbers stored in the Units array, because they are strings.
			promptAMDInRange();
		}
		function callbackPort () {
			console.log('port');
			ASdef = 8; // “in port” ships only defend at MD of 8 regardless of its own (A)MD (5.363)
			promptAMDInRange();
		}
	}

	function promptSubmarineLocation () {
		return prompt("Is the defending submarine unit at sea or in port? (Type 'sea' or 'port')");
	}

	function promptAMDInRange () {
		bootbox.dialog({
			closeButton: false,
			animate: false,
			title: 'Area Missle Defense',
			message: 'Is there a unit providing Area Missile Defense (AMD) within range (same hex or adjacent hex) of the defending unit?',
			buttons: {
				btnYes: {
					label: 'Yes',
					className: 'btn-primary',
					callback: callbackYes
				},
				btnNo: {
					label: 'No',
					className: 'btn-danger',
					callback: callbackNo
				}
			}
		});
		function callbackYes () {
			promptAMDScore();
		}
		function callbackNo () {
			// Lease ASdef unchanged.
			showDefenderDefenseScores();
			showValidWeaponsSystems(Attacker, AAdef, AGdef, ASdef, CAdef, Gdef, Tdef, Udef);
		}
	}

	function promptAMDScore () {
		bootbox.dialog({
			closeButton: false,
			animate: false,
			title: 'Area Missle Defense Score',
			message: 'How much AMD does the unit providing Area Missle Defense have?',
			buttons: {
				btn10: {
					label: 'AMD 10',
					className: 'btn-primary',
					callback: callback10
				},
				btn11: {
					label: 'AMD 11',
					className: 'btn-primary',
					callback: callback11
				}
			}
		});
		function callback10 () {
			// Set ASdef to AMD if AMD is greater than the existing ASdef
			if (ASdef < 10) {
				ASdef = 10;
			}
			showDefenderDefenseScores();
			showValidWeaponsSystems(Attacker, AAdef, AGdef, ASdef, CAdef, Gdef, Tdef, Udef);
		}
		function callback11 () {
			// Set ASdef to AMD if AMD is greater than the existing ASdef
			if (ASdef < 11) {
				ASdef = 11;
			}
			showDefenderDefenseScores();
			showValidWeaponsSystems(Attacker, AAdef, AGdef, ASdef, CAdef, Gdef, Tdef, Udef);
		}
	}

	function showDefenderDefenseScores () {
		var html = '<div class="col-md-12">';
		html += '<p>The defending unit has the following defense scores</p>';
		html += '<p>AA Def:' + AAdef + '</p>';
		html += '<p>AG Def:' + AGdef + '</p>';
		html += '<p>AS Def:' + ASdef + '</p>';
		html += '<p>CA Def:' + CAdef + '</p>';
		html += '<p>G Def:' + Gdef + '</p>';
		html += '<p>T Def:' + Tdef + '</p>';
		html += '<p>U Def:' + Udef + '</p>';
		$('#divDefenderDefenseScores').html(html);
		$('#divDefenderDefenseScores').show();
	}
	function showValidWeaponsSystems (Attacker, AAdef, AGdef, ASdef, CAdef, Gdef, Tdef, Udef) {
		var untargetable = true; // If this variable is not false by the end of this function, then the attacker has no weapons systems that can target this defender.

		if (AAdef !== null) {
			if (Attacker.aa !== 'x') {
				untargetable = false;
				$('#btnAA').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (AGdef !== null) {
			if (Attacker.ag !== 'x') {
				untargetable = false;
				$('#btnAG').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (ASdef !== null) {
			if (Attacker.as !== 'x') {
				untargetable = false;
				$('#btnAS').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (CAdef !== null) {
			if (Attacker.ca !== 'x') {
				untargetable = false;
				$('#btnCA').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (Gdef !== null) {
			if (Attacker.g !== 'x') {
				untargetable = false;
				$('#btnG').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (Tdef !== null) {
			if (Attacker.t !== 'x') {
				untargetable = false;
				$('#btnT').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (Udef !== null) {
			if (Attacker.u !== 'x') {
				untargetable = false;
				$('#btnU').prop('disabled', false).attr('class', 'btn btn-success');
			}
		}
		if (untargetable === false) {
			$('#divWeaponsSystems').show();
		} else {
			$('#divUntargetable').show();
		}
	}

	// ==================== Attack Calculations ====================

	$('#btnAA').on('click', function () {
		Strike = parseFloat(Attacker.aa);
		DefScore = AAdef;
		promptAttackerTicks(promptAirRangeCheck);
	});
	$('#btnAG').on('click', function () {
		Strike = parseFloat(Attacker.ag);
		DefScore = AGdef;
		promptAttackerTicks(promptAirRangeCheck);
	});
	$('#btnAS').on('click', function () {
		Strike = parseFloat(Attacker.as);
		DefScore = ASdef;
		promptAttackerTicks(promptAirRangeCheck);
	});
	$('#btnCA').on('click', function () {
		Strike = parseFloat(Attacker.ca);
		DefScore = CAdef;
		promptAttackerTicks();
	});
	$('#btnG').on('click', function () {
		Strike = parseFloat(Attacker.g);
		DefScore = Gdef;
		promptAttackerTicks();
	});
	$('#btnT').on('click', function () {
		Strike = parseFloat(Attacker.t);
		DefScore = Tdef;
		promptAttackerTicks();
	});
	$('#btnU').on('click', function () {
		Strike = parseFloat(Attacker.u);
		DefScore = Udef;
		promptAttackerTicks(promptAirRangeCheck);
	});

	function promptAirRangeCheck () {
		if (Attacker.type === 'Air') {
			var maxDistance = parseFloat(Attacker.move) / 2;

			bootbox.dialog({
				closeButton: false,
				animate: false,
				title: 'Air Range',
				message: 'Is the Attcking unit\'s hex more than ' + maxDistance + ' hexes (1/2 attacker\'s move radius) from the defending unit\'s hex?',
				buttons: {
					btnYes: {
						label: 'Yes, -1 to strike',
						className: 'btn-danger',
						callback: callbackYes
					},
					btnNo: {
						label: 'No, strike unchanged',
						className: 'btn-success',
						callback: callbackNo
					}
				}
			});
			function callbackYes () {
				Strike = Strike - 1;
				showRequiredRoll();
			}
			function callbackNo () {
				// Strike is unchanged.
				showRequiredRoll();
			}
		}
	}

	function promptAttackerTicks (nextStep) {
		bootbox.dialog({
			closeButton: false,
			animate: false,
			title: 'Missing Ticks',
			message: 'Is the attacking unit missing any ticks?',
			buttons: {
				btnYes: {
					label: 'Yes, -1 to strike',
					className: 'btn-danger',
					callback: callbackYes
				},
				btnNo: {
					label: 'No, strike unchanged',
					className: 'btn-success',
					callback: callbackNo
				}
			}
		});
		function callbackYes () {
			Strike = Strike - 1;
			nextStep();
		}
		function callbackNo () {
			// Strike is unchanged.
			nextStep();
		}
	}

	function showRequiredRoll () {
		var roll = DefScore - Strike;
		alert('defscore ' + DefScore + ' strike ' + Strike + ' roll ' + roll + 'To inflict 1 tick of damage you must roll ' + (roll + 1));
	}
})(window);
